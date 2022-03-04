const EventEmitter = require('events');

const {isLnd} = require('./../../lnd_requests');

const cancelError = 'Cancelled on client';
const events = ['connected', 'disconnected', 'error'];
const method = 'subscribePeerEvents';
const sumOf = arr => arr.reduce((sum, n) => sum + n, Number());
const type = 'default';

/** Subscribe to peer connectivity events

  Requires `peers:read` permission

  {
    lnd: <Authenticated LND API Object>
  }

  @throws
  <Error>

  @returns
  <EventEmitter Object>

  @event 'connected'
  {
    public_key: <Connected Peer Public Key Hex String>
  }

  @event 'disconnected'
  {
    public_key: <Disconnected Peer Public Key Hex String>
  }
*/
module.exports = ({lnd}) => {
  if (!isLnd({lnd, method, type})) {
    throw new Error('ExpectedAuthenticatedLndToSubscribeToPeers');
  }

  const emitter = new EventEmitter();
  const subscription = lnd.default[method]({});

  // Cancel the subscription when all listeners are removed
  emitter.on('removeListener', () => {
    const listenerCounts = events.map(n => emitter.listenerCount(n));

    // Exit early when there are still listeners
    if (!!sumOf(listenerCounts)) {
      return;
    }

    subscription.cancel();

    return;
  });

  const emitError = err => {
    if (!!err && err.details === cancelError) {
      subscription.removeAllListeners();
    }

    // Exit early when no one is listening to the error
    if (!emitter.listenerCount('error')) {
      return;
    }

    return emitter.emit('error', err);
  };

  subscription.on('data', peer => {
    if (!peer) {
      return emitError(new Error('ExpectedPeerInPeerEventData'));
    }

    if (!peer.pub_key) {
      return emitError(new Error('ExpectedPeerPublicKeyInPeerEventData'));
    }

    switch (peer.type) {
    case 'PEER_OFFLINE':
      return emitter.emit('disconnected', {public_key: peer.pub_key});

    case 'PEER_ONLINE':
      return emitter.emit('connected', {public_key: peer.pub_key});

    default:
      return;
    }
  });

  subscription.on('end', () => emitter.emit('end', {}));
  subscription.on('error', err => emitError(err));
  subscription.on('status', status => emitter.emit('status', status));

  return emitter;
};
