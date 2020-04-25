const EventEmitter = require('events');

const {chanFormat} = require('bolt07');

const {isLnd} = require('./../../lnd_requests');
const {forwardFromHtlcEvent} = require('./../../lnd_responses');

const event = 'forward';
const method = 'subscribeHtlcEvents';
const type = 'router';

/** Subscribe to HTLC events

  Requires `offchain:read` permission

  This method is not supported on LND 0.9.2 and below

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
    [in_channel]: <Inbound Standard Format Channel Id String>
    [in_payment]: <Inbound Channel Payment Id Number>
    [internal_failure]: <Private Failure Reason String>
    is_confirmed: <Forward Is Confirmed Bool>
    is_failed: <Forward Is Failed Bool>
    is_receive: <Is Receive Bool>
    is_send: <Is Send Bool>
    [mtokens]: <Sending Millitokens Number>
    [out_channel]: <Outgoing Standard Format Channel Id String>
    [out_payment]: <Outgoing Channel Payment Id Number>
    [timeout]: <Forward Timeout at Height Number>
    [tokens]: <Sending Tokens Number>
  }
*/
module.exports = ({lnd}) => {
  if (!isLnd({lnd, method, type})) {
    throw new Error('ExpectedAuthenticatedLndToSubscribeToForwards');
  }

  const emitter = new EventEmitter();
  const sub = lnd[type][method]({});

  const emitErr = err => {
    if (!emitter.listenerCount('error')) {
      return;
    }

    return emitter.emit('error', err);
  };

  sub.on('data', data => {
    try {
      emitter.emit(event, forwardFromHtlcEvent(data));
    } catch (err) {
      emitErr([503, err.message]);
    }

    return;
  });

  sub.on('end', () => emitter.emit('end'));
  sub.on('error', err => emitErr(err));
  sub.on('status', n => emitter.emit('status', n));

  return emitter;
};
