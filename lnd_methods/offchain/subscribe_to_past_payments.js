const {createHash} = require('crypto');
const EventEmitter = require('events');

const asyncDoUntil = require('async/doUntil');
const {chanFormat} = require('bolt07');

const {emitSubscriptionError} = require('./../../grpc');
const {forwardFromHtlcEvent} = require('./../../lnd_responses');
const getPayment = require('./get_payment');
const {isLnd} = require('./../../lnd_requests');

const bufferAsHex = buffer => buffer.toString('hex');
const cancelError = 'Cancelled on client';
const event = 'payment';
const hexAsBuffer = hex => Buffer.from(hex, 'hex');
const method = 'subscribeHtlcEvents';
const restartForwardListenerDelayMs = 1e3;
const sha256 = preimage => createHash('sha256').update(preimage).digest();
const type = 'router';
const unknownFailureMessage = '2 UNKNOWN: unknown failure detail type: <nil>';

/** Subscribe to successful outgoing payments

  Payments may be omitted if LND does not finalize the payment record

  Requires `offchain:read` permission

  Note: Method not supported on LND 0.13.4 and below

  {
    lnd: <Authenticated LND API Object>
  }

  @throws
  <Error>

  @returns
  <Subscription EventEmitter Object>

  @event 'error'
  <Error Object>

  @event 'payment'
  {
    confirmed_at: <Payment Confirmed At ISO 8601 Date String>
    created_at: <Payment Created At ISO 8601 Date String>
    destination: <Payment Destination Hex String>
    fee: <Paid Routing Fee Rounded Down Tokens Number>
    fee_mtokens: <Paid Routing Fee in Millitokens String>
    id: <Payment Preimage Hash String>
    mtokens: <Millitokens Sent to Destination String>
    paths: [{
      fee_mtokens: <Total Fee Millitokens Paid String>
      hops: [{
        channel: <Standard Format Channel Id String>
        channel_capacity: <Channel Capacity Tokens Number>
        fee: <Fee Tokens Rounded Down Number>
        fee_mtokens: <Fee Millitokens String>
        forward_mtokens: <Forward Millitokens String>
        public_key: <Public Key Hex String>
        timeout: <Timeout Block Height Number>
      }]
      mtokens: <Total Millitokens Paid String>
    }]
    [request]: <BOLT 11 Encoded Payment Request String>
    safe_fee: <Total Fee Tokens Paid Rounded Up Number>
    safe_tokens: <Total Tokens Paid, Rounded Up Number>
    secret: <Payment Preimage Hex String>
    timeout: <Expiration Block Height Number>
    tokens: <Total Tokens Paid Rounded Down Number>
  }
*/
module.exports = ({lnd}) => {
  if (!isLnd({lnd, method, type})) {
    throw new Error('ExpectedAuthenticatedLndToSubscribeToPayments');
  }

  const emitter = new EventEmitter();
  const sub = lnd[type][method]({});

  const emitErr = emitSubscriptionError({emitter, subscription: sub});

  sub.on('data', data => {
    // Exit early on subscribed events
    if (!!data && !!data.subscribed_event) {
      return;
    }

    if (!!data && !!data.final_htlc_event) {
      return;
    }

    try {
      const htlc = forwardFromHtlcEvent(data);

      // Exit early when the HTLC is not a send
      if (!htlc.is_send || !htlc.secret) {
        return;
      }

      return getPayment({
        lnd,
        id: bufferAsHex(sha256(hexAsBuffer(htlc.secret))),
      },
      (err, res) => {
        if (!!err) {
          return;
        }

        // Exit early when there is no payment
        if (!res.payment) {
          return;
        }

        // Emit payment details
        return emitter.emit(event, res.payment);
      });
    } catch (err) {
      return emitErr([503, err.message]);
    }
  });

  sub.on('error', err => emitErr([503, 'UnexpectedPastPaymentsErr', {err}]));

  return emitter;
};
