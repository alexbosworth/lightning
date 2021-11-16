const {createHash} = require('crypto');
const EventEmitter = require('events');

const asyncAuto = require('async/auto');
const {chanFormat} = require('bolt07');

const {confirmedFromPayment} = require('./../../lnd_responses');
const {confirmedFromPaymentStatus} = require('./../../lnd_responses');
const emitPayment = require('./emit_payment');
const {failureFromPayment} = require('./../../lnd_responses');
const {handleRemoveListener} = require('./../../grpc');
const {isLnd} = require('./../../lnd_requests');
const {safeTokens} = require('./../../bolt00');
const {states} = require('./payment_states');

const events = ['confirmed', 'failed', 'paying'];
const hexToBuffer = hex => Buffer.from(hex, 'hex');
const {isArray} = Array;
const isHash = n => /^[0-9A-F]{64}$/i.test(n);
const method = 'trackPaymentV2';
const mtokensPerToken = BigInt(1e3);
const {nextTick} = process;
const paymentNotInitiatedErr = `payment isn't initiated`;
const sha256 = preimage => createHash('sha256').update(preimage).digest();
const type = 'router';
const unknownServiceErr = 'unknown service verrpc.Versioner';

/** Subscribe to the status of a past payment

  Requires `offchain:read` permission

  {
    id: <Payment Request Hash Hex String>
    lnd: <Authenticated LND API Object>
  }

  @throws
  <Error>

  @returns
  <Subscription EventEmitter Object>

  @event 'confirmed'
  {
    confirmed_at: <Payment Confirmed At ISO 8601 Date String>
    created_at: <Payment Created At ISO 8601 Date String>
    destination: <Payment Destination Hex String>
    fee: <Total Fee Tokens Paid Rounded Down Number>
    fee_mtokens: <Total Fee Millitokens Paid String>
    id: <Payment Hash Hex String>
    mtokens: <Total Millitokens Paid String>
    paths: [{
      fee: <Total Fee Tokens Paid Number>
      fee_mtokens: <Total Fee Millitokens Paid String>
      hops: [{
        channel: <Standard Format Channel Id String>
        channel_capacity: <Channel Capacity Tokens Number>
        fee: <Fee Tokens Rounded Down Number>
        fee_mtokens: <Fee Millitokens String>
        forward: <Forward Tokens Number>
        forward_mtokens: <Forward Millitokens String>
        public_key: <Public Key Hex String>
        timeout: <Timeout Block Height Number>
      }]
      mtokens: <Total Millitokens Paid String>
      safe_fee: <Total Fee Tokens Paid Rounded Up Number>
      safe_tokens: <Total Tokens Paid, Rounded Up Number>
      timeout: <Expiration Block Height Number>
    }]
    [request]: <BOLT 11 Encoded Payment Request String>
    safe_fee: <Total Fee Tokens Paid Rounded Up Number>
    safe_tokens: <Total Tokens Paid, Rounded Up Number>
    secret: <Payment Preimage Hex String>
    timeout: <Expiration Block Height Number>
    tokens: <Total Tokens Paid Rounded Down Number>
  }

  @event 'failed'
  {
    is_insufficient_balance: <Failed Due To Lack of Balance Bool>
    is_invalid_payment: <Failed Due to Payment Rejected At Destination Bool>
    is_pathfinding_timeout: <Failed Due to Pathfinding Timeout Bool>
    is_route_not_found: <Failed Due to Absence of Path Through Graph Bool>
  }

  @event 'paying'
  {
    created_at: <Payment Created At ISO 8601 Date String>
    destination: <Payment Destination Hex String>
    id: <Payment Hash Hex String>
    mtokens: <Total Millitokens Pending String>
    paths: [{
      fee: <Total Fee Tokens Pending Number>
      fee_mtokens: <Total Fee Millitokens Pending String>
      hops: [{
        channel: <Standard Format Channel Id String>
        channel_capacity: <Channel Capacity Tokens Number>
        fee: <Fee Tokens Rounded Down Number>
        fee_mtokens: <Fee Millitokens String>
        forward: <Forward Tokens Number>
        forward_mtokens: <Forward Millitokens String>
        public_key: <Public Key Hex String>
        timeout: <Timeout Block Height Number>
      }]
      mtokens: <Total Millitokens Pending String>
      safe_fee: <Total Fee Tokens Pending Rounded Up Number>
      safe_tokens: <Total Tokens Pending, Rounded Up Number>
      timeout: <Expiration Block Height Number>
    }]
    [request]: <BOLT 11 Encoded Payment Request String>
    safe_tokens: <Total Tokens Pending, Rounded Up Number>
    [timeout]: <Expiration Block Height Number>
    tokens: <Total Tokens Pending Rounded Down Number>
  }
*/
module.exports = args => {
  if (!isHash(args.id)) {
    throw new Error('ExpectedIdOfPastPaymentToSubscribeTo');
  }

  if (!isLnd({method, type, lnd: args.lnd})) {
    throw new Error('ExpectedAuthenticatedLndToSubscribeToPastPaymentStatus');
  }

  const emitter = new EventEmitter();
  const hash = hexToBuffer(args.id);

  const emitError = err => {
    if (!emitter.listenerCount('error')) {
      return;
    }

    if (!!isArray(err)) {
      return emitter.emit('error', err);
    }

    if (err.details === paymentNotInitiatedErr) {
      return emitter.emit('error', [404, 'SentPaymentNotFound']);
    }

    return emitter.emit('error', [503, 'UnexpectedGetPaymentError', {err}]);
  };

  const sub = args.lnd[type][method]({payment_hash: hash});

  // Terminate subscription when all listeners are removed
  handleRemoveListener({emitter, events, subscription: sub});

  sub.on('data', data => emitPayment({data, emitter}));
  sub.on('end', () => emitter.emit('end'));
  sub.on('error', err => emitError(err));

  return emitter;
};
