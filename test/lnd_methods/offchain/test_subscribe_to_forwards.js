const {deepStrictEqual} = require('node:assert').strict;
const EventEmitter = require('node:events');
const {promisify} = require('node:util');
const test = require('node:test');
const {throws} = require('node:assert').strict;

const {subscribeToForwards} = require('./../../../');
const {subscriptionEvents} = require('./../macros');

const delay = promisify(setTimeout);
const listenerFailure = {event: 'error', data: [503, 'ListenerFailure']};
const parseError = 'ExpectedHtlcEventTypeToDeriveForwardFromHtlcEvent';
const restartDelayMs = 1100;
const unknownFailure = '2 UNKNOWN: unknown failure detail type: <nil>';

const makeForwardResponse = () => {
  return {
    event_type: 'UNKNOWN',
    incoming_channel_id: '1',
    incoming_htlc_id: '0',
    outgoing_channel_id: '2',
    outgoing_htlc_id: '1',
    settle_event: {preimage: Buffer.alloc(0)},
    timestamp_ns: (1e6).toString(),
  };
};

// The forward that is emitted for the forward response
const forward = {
  event: 'forward',
  data: {
    at: '1970-01-01T00:00:00.001Z',
    cltv_delta: undefined,
    external_failure: undefined,
    fee: undefined,
    fee_mtokens: undefined,
    in_channel: '0x0x1',
    in_payment: 0,
    internal_failure: undefined,
    is_confirmed: true,
    is_failed: false,
    is_receive: false,
    is_send: false,
    mtokens: undefined,
    out_channel: '0x0x2',
    out_payment: 1,
    secret: undefined,
    timeout: undefined,
    tokens: undefined,
  },
};
const unreadable = {event: 'error', data: [503, parseError]};

const tests = [
  {
    args: {},
    description: 'An LND object is required to subscribe to forwards',
    error: 'ExpectedAuthenticatedLndToSubscribeToForwards',
  },
  {
    args: {},
    description: 'Forwards are emitted and stream errors are relayed',
    expected: {
      events: [unreadable, forward, {event: 'error', data: new Error('err')}],
    },
    stream: [
      ['data', {}],
      ['data', makeForwardResponse()],
      ['error', new Error('err')],
    ],
  },
  {
    args: {},
    description: 'Errors are ignored without an error listener',
    expected: {events: [forward]},
    listening: ['forward'],
    stream: [
      ['data', {}],
      ['data', makeForwardResponse()],
      ['error', new Error('err')],
    ],
  },
  {
    args: {},
    description: 'A throwing listener is reported without ending the stream',
    expected: {events: [forward, listenerFailure, forward, listenerFailure]},
    stream: [['data', makeForwardResponse()], ['data', makeForwardResponse()]],
    throwing: ['forward'],
  },
];

tests.forEach(({args, description, error, expected, ...scenario}) => {
  return test(description, async () => {
    if (!!error) {
      throws(() => subscribeToForwards(args), new Error(error), 'Got error');

      return;
    }

    // Removing the listeners cancels the stream and stops the restart loop
    const got = await subscriptionEvents({
      ...scenario,
      events: ['error', 'forward'],
      removing: ['error', 'forward'],
      subscribe: stream => {
        args.lnd = {router: {subscribeHtlcEvents: () => stream}};

        return subscribeToForwards(args);
      },
    });

    deepStrictEqual(got, {cancels: ['cancel'], ...expected}, 'Got events');

    return;
  });
});

// The subscription restarts itself after a stream failure, and both the
// first stream and the restarted streams survive a throwing listener
test('A failed stream is restarted after a delay', async () => {
  const errors = [];
  const forwards = [];
  const stream = new EventEmitter();

  stream.cancel = () => {};

  const sub = subscribeToForwards({
    lnd: {router: {subscribeHtlcEvents: ({}) => stream}},
  });

  sub.on('error', err => errors.push(err));
  sub.on('forward', forward => forwards.push(forward));

  // A throwing listener is a consumer defect and must not end the stream
  sub.on('forward', () => {
    throw new Error('ListenerFailure');
  });

  // Subscription bookkeeping events and unreadable events are not forwards
  stream.emit('data', makeForwardResponse());
  stream.emit('data', {subscribed_event: {}});
  stream.emit('data', {final_htlc_event: {}});
  stream.emit('data', {});

  // A stream failure is reported and stops the stream
  stream.emit('error', new Error('StreamFailure'));

  deepStrictEqual(stream.listenerCount('data'), 0, 'Failed stream stopped');

  // After the restart delay the subscription is re-established
  await delay(restartDelayMs);

  deepStrictEqual(stream.listenerCount('data'), 1, 'Subscription restarted');

  stream.emit('data', makeForwardResponse());
  stream.emit('data', {});

  // A restarted stream failure is reported and restarts the stream again
  stream.emit('error', new Error('RestartFailure'));

  deepStrictEqual(stream.listenerCount('data'), 0, 'Restarted stream stopped');

  await delay(restartDelayMs);

  deepStrictEqual(stream.listenerCount('data'), 1, 'Restarted again');

  // Without an error listener, errors are dropped rather than thrown
  sub.removeAllListeners('error');

  stream.emit('data', {});

  // The known unknown failure on a restarted stream is not reported
  stream.emit('error', new Error(unknownFailure));

  deepStrictEqual(stream.listenerCount('data'), 0, 'Unknown failure stops');

  // Removing the forward listeners ends the subscription at the next retry
  const ends = [];

  sub.on('end', () => ends.push(true));

  sub.removeAllListeners('forward');

  await delay(restartDelayMs);

  deepStrictEqual(ends, [true], 'Subscription ended');
  deepStrictEqual(forwards, [forward.data, forward.data], 'Got forwards');
  deepStrictEqual(errors, [
    [503, 'ListenerFailure'],
    [503, parseError],
    new Error('StreamFailure'),
    [503, 'ListenerFailure'],
    [503, parseError],
    new Error('RestartFailure'),
  ],
  'Got expected errors');

  sub.removeAllListeners();

  return;
});
