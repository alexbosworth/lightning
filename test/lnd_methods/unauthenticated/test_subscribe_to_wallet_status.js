const {deepStrictEqual} = require('node:assert').strict;
const EventEmitter = require('node:events');
const {promisify} = require('node:util');
const test = require('node:test');
const {throws} = require('node:assert').strict;

const {subscribeToWalletStatus} = require('./../../../lnd_methods');

const allEvents = [
  'absent',
  'active',
  'error',
  'locked',
  'ready',
  'starting',
  'waiting',
];
const nextTick = promisify(process.nextTick);

// Make an LND that sends a state or an error to its wallet status subscription
const makeLnd = ({data, err}) => {
  const subscription = new EventEmitter();

  subscription.cancels = 0;
  subscription.cancel = () => subscription.cancels++;

  return {
    status: {
      subscribeState: ({}) => {
        process.nextTick(() => {
          if (err !== undefined) {
            return subscription.emit('error', err);
          }

          return subscription.emit('data', data);
        });

        return subscription;
      },
    },
    subscription,
  };
};

const tests = [
  {
    args: {},
    description: 'An LND object is required',
    error: 'ExpectedAuthenticatedLndToSubscribeToWalletStatus',
  },
  {
    args: {lnd: {}},
    description: 'An LND object with a status subscription is required',
    error: 'ExpectedAuthenticatedLndToSubscribeToWalletStatus',
  },
  {
    args: {lnd: makeLnd({data: {state: 'NON_EXISTING'}})},
    description: 'Absent wallet state emitted',
    expected: {events: [{data: {}, event: 'absent'}], is_listening: true},
  },
  {
    args: {lnd: makeLnd({data: {state: 'RPC_ACTIVE'}})},
    description: 'Active wallet state emitted',
    expected: {events: [{data: {}, event: 'active'}], is_listening: true},
  },
  {
    args: {lnd: makeLnd({data: {state: 'LOCKED'}})},
    description: 'Locked wallet state emitted',
    expected: {events: [{data: {}, event: 'locked'}], is_listening: true},
  },
  {
    args: {lnd: makeLnd({data: {state: 'SERVER_ACTIVE'}})},
    description: 'Ready server state emitted',
    expected: {events: [{data: {}, event: 'ready'}], is_listening: true},
  },
  {
    args: {lnd: makeLnd({data: {state: 'UNLOCKED'}})},
    description: 'Starting wallet state emitted',
    expected: {events: [{data: {}, event: 'starting'}], is_listening: true},
  },
  {
    args: {lnd: makeLnd({data: {state: 'WAITING_TO_START'}})},
    description: 'Waiting to start state emitted',
    expected: {events: [{data: {}, event: 'waiting'}], is_listening: true},
  },
  {
    args: {lnd: makeLnd({data: {state: 'UNKNOWN_STATE'}})},
    description: 'An unknown state emits nothing',
    expected: {events: [], is_listening: true},
  },
  {
    args: {lnd: makeLnd({data: null})},
    description: 'A state is expected',
    expected: {
      events: [{
        data: new Error('ExpectedStateFromWalletStatus'),
        event: 'error',
      }],
      is_listening: true,
    },
  },
  {
    args: {lnd: makeLnd({err: 'err'})},
    description: 'Errors are passed back',
    expected: {events: [{data: 'err', event: 'error'}], is_listening: true},
  },
  {
    args: {lnd: makeLnd({err: {details: 'Cancelled on client'}})},
    description: 'A cancel error stops listening to the subscription',
    expected: {
      events: [{data: {details: 'Cancelled on client'}, event: 'error'}],
      is_listening: false,
    },
  },
  {
    args: {lnd: makeLnd({err: 'err'})},
    description: 'Errors are not emitted when nobody is listening for them',
    expected: {events: [], is_listening: true},
    listen: ['locked'],
  },
  {
    args: {lnd: makeLnd({data: {state: 'LOCKED'}})},
    description: 'Subscription is cancelled when all listeners are removed',
    expected: {cancels: [0, 1], events: [], is_listening: true},
    listen: ['active', 'error'],
  },
];

tests.forEach(({args, description, error, expected, listen}) => {
  return test(description, async () => {
    if (!!error) {
      throws(() => subscribeToWalletStatus(args), new Error(error), 'Error');

      return;
    }

    const events = [];
    const {subscription} = args.lnd;
    const sub = subscribeToWalletStatus(args);

    (listen || allEvents).forEach(event => {
      return sub.on(event, data => events.push({data, event}));
    });

    await nextTick();

    const isListening = !!subscription.listenerCount('data');

    deepStrictEqual(events, expected.events, 'Got expected events');
    deepStrictEqual(isListening, expected.is_listening, 'Listening to LND');

    // Stop listening one event at a time, noting when LND gets cancelled
    const cancels = (listen || allEvents).map(event => {
      sub.removeAllListeners(event);

      return subscription.cancels;
    });

    if (!!expected.cancels) {
      deepStrictEqual(cancels, expected.cancels, 'Got expected cancels');
    }

    return;
  });
});
