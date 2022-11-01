const EventEmitter = require('events');

const emitPayment = require('./emit_payment');
const {emitSubscriptionError} = require('./../../grpc');
const {handleRemoveListener} = require('./../../grpc');
const {isLnd} = require('./../../lnd_requests');

const events = ['confirmed', 'failed', 'paying'];
const method = 'trackPayments';
const type = 'router';

/** Subscribe to outgoing payments

  Requires `offchain:read` permission

  Note: Method not supported on LND 0.15.4 and below

  {
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
module.exports = ({lnd}) => {
  if (!isLnd({lnd, method, type})) {
    throw new Error('ExpectedAuthenticatedLndToSubscribeToCurrentPayments');
  }

  const emitter = new EventEmitter();
  const sub = lnd[type][method]({});

  const emitErr = emitSubscriptionError({emitter, subscription: sub});

  // Terminate subscription when all listeners are removed
  handleRemoveListener({emitter, events, subscription: sub});

  sub.on('data', data => emitPayment({data, emitter}));
  sub.on('error', err => emitErr([503, 'UnexpectedPaymentsSubErr', {err}]));

  return emitter;
};
