const EventEmitter = require('events');

const {emitSubscriptionError} = require('./../../grpc');
const {handleRemoveListener} = require('./../../grpc');
const {isLnd} = require('./../../lnd_requests');
const {rpcOnionMessageAsMessage} = require('./../../lnd_responses');

const errorUnknownMethod = /unknown method SubscribeOnionMessages/;
const events = ['message_received'];
const isMultiPayload = n => !!n && keys(n.custom_records || {}).length > 1;
const {keys} = Object;
const method = 'subscribeOnionMessages';
const type = 'default';

/** Subscribe to received onion messages

  Requires `offchain:read` permission

  This method is not supported in LND 0.20.4 and below

  {
    lnd: <Authenticated LND API Object>
  }

  @returns
  <EventEmitter Object>

  @event 'message_received'
  {
    encrypted: <Encrypted Data Hex String>
    key: <Path Key Hex String>
    [message]: {
      type: <Message Payload Record Type Number String>
      value: <Message Payload Hex String>
    }
    onion: <Onion Packet Hex String>
    [reply]: {
      inbound: [{
        encrypted_data: <Encrypted Data Hex String>
        relay_key: <Blinded Relay Key Hex String>
      }]
      [introduction_edge]: <Introduction Node Edge Format Channel Id String>
      [introduction_node]: <Introduction Node Public Key Hex String>
      key: <Path Key Hex String>
    }
    via: <Message Received Via Peer with Id Public Key Hex String>
  }
*/
module.exports = ({lnd}) => {
  if (!isLnd({lnd, method, type})) {
    throw new Error('ExpectedAuthenticatedLndToSubscribeToMessages');
  }

  const emitter = new EventEmitter();
  const subscription = lnd[type][method]({});

  const errored = emitSubscriptionError({emitter, subscription});

  // Terminate subscription when all listeners are removed
  handleRemoveListener({subscription, emitter, events});

  subscription.on('end', () => emitter.emit('end'));
  subscription.on('status', n => emitter.emit('status', n));

  subscription.on('error', err => {
    // LND 0.20.4 and below do not have the onion messages subscription
    if (!!err && errorUnknownMethod.test(err.details)) {
      return errored([501, 'SubscribeOnionMessagesMethodUnsupported']);
    }

    return errored(err);
  });

  subscription.on('data', data => {
    // LND before 0.21.2 relays invalid messages with multiple payload records
    if (isMultiPayload(data)) {
      return;
    }

    try {
      return emitter.emit('message_received', rpcOnionMessageAsMessage(data));
    } catch (err) {
      return errored([503, err.message]);
    }
  });

  return emitter;
};
