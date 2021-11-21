const EventEmitter = require('events');

const {isLnd} = require('./../../lnd_requests');

const cancelError = 'Cancelled on client';
const events = ['active', 'locked', 'error', 'starting'];
const method = 'subscribeState';
const stateAbsent = 'NON_EXISTING';
const stateActive = 'RPC_ACTIVE';
const stateLocked = 'LOCKED';
const stateReady = 'SERVER_ACTIVE';
const stateStarting = 'UNLOCKED';
const stateWaiting = 'WAITING_TO_START';
const sumOf = arr => arr.reduce((sum, n) => sum + n, Number());
const type = 'status';

/** Subscribe to wallet status events

  This method is not supported on LND 0.12.1 and below

  `ready` is not supported on LND 0.13.4 and below

  {
    lnd: <Unauthenticated LND API Object>
  }

  @throws
  <Error>

  @returns
  <EventEmitter Object>

  // The wallet has yet to be created
  @event 'absent'

  // The wallet is activated and ready for all requests
  @event 'active'

  // An error occurred
  @event 'error'
  <Error>

  // The wallet is inactive because it is locked
  @event 'locked'

  // The wallet is ready for all RPC server requests
  @event 'ready'

  // The wallet is in the process of starting
  @event 'starting'

  // The wallet is waiting for leader election
  @event 'waiting'
*/
module.exports = ({lnd}) => {
  if (!isLnd({lnd, method, type})) {
    throw new Error('ExpectedAuthenticatedLndToSubscribeToWalletStatus');
  }

  const emitter = new EventEmitter();
  const subscription = lnd[type][method]({});

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

  subscription.on('data', state => {
    if (!state) {
      return emitError(new Error('ExpectedStateFromWalletStatus'));
    }

    switch (state.state) {
    case stateAbsent:
      return emitter.emit('absent', {});

    case stateActive:
      return emitter.emit('active', {});

    case stateLocked:
      return emitter.emit('locked', {});

    case stateReady:
      return emitter.emit('ready', {});

    case stateStarting:
      return emitter.emit('starting', {});

    case stateWaiting:
      return emitter.emit('waiting', {});

    default:
      break;
    }
  });

  subscription.on('error', err => emitError(err));

  return emitter;
};
