const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

const {subscribeToBackups} = require('./../../../');
const {subscriptionEvents} = require('./../macros');

const backup = {
  event: 'backup',
  data: {
    backup: '00',
    channels: [{
      backup: '00',
      transaction_id: Buffer.alloc(32).toString('hex'),
      transaction_vout: 0,
    }],
  },
};
const cancelled = {details: 'Cancelled on client'};
const listenerFailure = {event: 'error', data: [503, 'ListenerFailure']};
const snapshot = {
  single_chan_backups: {
    chan_backups: [{
      chan_backup: Buffer.alloc(1),
      chan_point: {funding_txid_bytes: Buffer.alloc(32), output_index: 0},
    }],
  },
  multi_chan_backup: {
    chan_points: [{funding_txid_bytes: Buffer.alloc(32), output_index: 0}],
    multi_chan_backup: Buffer.alloc(1),
  },
};

// The mock LND stream delivers a backup, a status, an end and a cancel error
const defaultStream = [
  ['data', snapshot],
  ['status', {status: 'status'}],
  ['end'],
  ['error', cancelled],
];

const tests = [
  {
    args: {},
    description: 'An LND object is required to subscribe to channels',
    error: 'ExpectedAuthenticatedLndToSubscribeToBackups',
  },
  {
    args: {},
    description: 'An error event is triggered when getting an invalid backup',
    expected: {
      cancels: ['cancel', 'cancel'],
      events: [
        {event: 'error', data: [503, 'ExpectedMultiChannelBackupInSnapshot']},
        {event: 'error', data: cancelled},
      ],
    },
    stream: [['data', 'data'], ['error', cancelled]],
  },
  {
    args: {},
    description: 'Channel events are returned from channels subscription',
    expected: {
      cancels: ['cancel'],
      events: [
        backup,
        {event: 'status', data: {status: 'status'}},
        {event: 'end', data: undefined},
        {event: 'error', data: cancelled},
      ],
    },
  },
  {
    args: {},
    description: 'Stream errors are ignored without an error listener',
    expected: {cancels: ['cancel'], events: []},
    listening: ['backup'],
    stream: [['error', {details: 'err'}]],
  },
  {
    args: {},
    description: 'A throwing listener is reported without ending the stream',
    expected: {events: [backup, listenerFailure, backup, listenerFailure]},
    stream: [['data', snapshot], ['data', snapshot]],
    throwing: ['backup'],
  },
  {
    args: {},
    description: 'Removing the last backup listener cancels the stream',
    expected: {cancels: ['cancel'], events: []},
    removing: ['error', 'backup'],
    stream: [],
  },
];

tests.forEach(({args, description, error, expected, ...scenario}) => {
  return test(description, async () => {
    if (!!error) {
      throws(() => subscribeToBackups(args), new Error(error), 'Got error');

      return;
    }

    const got = await subscriptionEvents({
      ...scenario,
      events: ['backup', 'end', 'error', 'status'],
      stream: scenario.stream || defaultStream,
      subscribe: stream => {
        args.lnd = {default: {subscribeChannelBackups: () => stream}};

        return subscribeToBackups(args);
      },
    });

    deepStrictEqual(got, {cancels: [], ...expected}, 'Got expected events');

    return;
  });
});
