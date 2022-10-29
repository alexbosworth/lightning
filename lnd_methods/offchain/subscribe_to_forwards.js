const EventEmitter = require('events');

const asyncDoUntil = require('async/doUntil');
const {chanFormat} = require('bolt07');

const {forwardFromHtlcEvent} = require('./../../lnd_responses');
const {isLnd} = require('./../../lnd_requests');

const event = 'forward';
const method = 'subscribeHtlcEvents';
const restartForwardListenerDelayMs = 1e3;
const type = 'router';
const unknownFailureMessage = '2 UNKNOWN: unknown failure detail type: <nil>';

/** Subscribe to HTLC events

  Requires `offchain:read` permission

  Note: LND 0.13.4 and below do not return `secret` for forwards

  {
    lnd: <Authenticated LND API Object>
  }

  @throws
  <Error>

  @returns
  <Subscription EventEmitter Object>

  @event 'error'
  <Error Object>

  @event 'forward'
  {
    at: <Forward Update At ISO 8601 Date String>
    [external_failure]: <Public Failure Reason String>
    [fee]: <Fee Tokens Charged Number>
    [fee_mtokens]: <Fee Millitokens Charged String>
    [in_channel]: <Inbound Standard Format Channel Id String>
    [in_payment]: <Inbound Channel Payment Id Number>
    [internal_failure]: <Private Failure Reason String>
    is_confirmed: <Forward Is Confirmed Bool>
    is_failed: <Forward Is Failed Bool>
    is_receive: <Is Receive Bool>
    is_send: <Is Send Bool>
    [mtokens]: <Sending Millitokens String>
    [out_channel]: <Outgoing Standard Format Channel Id String>
    [out_payment]: <Outgoing Channel Payment Id Number>
    [secret]: <Settled Preimage Hex String>
    [timeout]: <Forward Timeout at Height Number>
    [tokens]: <Sending Tokens Number>
  }
*/
module.exports = ({lnd}) => {
  if (!isLnd({lnd, method, type})) {
    throw new Error('ExpectedAuthenticatedLndToSubscribeToForwards');
  }

  const emitter = new EventEmitter();

  const emitErr = err => {
    // Exit early when there are no error listeners
    if (!emitter.listenerCount('error')) {
      return;
    }

    return emitter.emit('error', err);
  };

  const sub = lnd[type][method]({});

  sub.on('data', data => {
    // Exit early on subscribed events
    if (!!data && !!data.subscribed_event) {
      return;
    }

    if (!!data && !!data.final_htlc_event) {
      return;
    }

    try {
      emitter.emit(event, forwardFromHtlcEvent(data));
    } catch (err) {
      emitErr([503, err.message]);
    }

    return;
  });

  sub.on('error', err => {
    sub.removeAllListeners();

    return emitErr(err);
  });

  asyncDoUntil(
    cbk => {
      if (!!sub.listenerCount('data')) {
        return setTimeout(cbk, restartForwardListenerDelayMs);
      }

      const subscription = lnd[type][method]({});

      subscription.on('data', data => {
        try {
          emitter.emit(event, forwardFromHtlcEvent(data));
        } catch (err) {
          emitErr([503, err.message]);
        }

        return;
      });

      subscription.on('error', err => {
        subscription.removeAllListeners();

        // The unknown failure message happens sometimes
        if (err.message !== unknownFailureMessage) {
          emitErr(err);
        }

        return setTimeout(cbk, restartForwardListenerDelayMs);
      });
    },
    cbk => cbk(null, !emitter.listenerCount('forward')),
    err => {
      if (!!err) {
        return emitErr(err);
      }

      emitter.emit('end', {});

      return;
    }
  );

  return emitter;
};
