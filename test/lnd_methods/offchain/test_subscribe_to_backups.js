const EventEmitter = require('events');
const {promisify} = require('util');

const {test} = require('@alexbosworth/tap');

const {subscribeToBackups} = require('./../../../');

const nextTick = promisify(process.nextTick);

const makeLnd = ({data, err}) => {
  return {
    default: {
      subscribeChannelBackups: ({}) => {
        const emitter = new EventEmitter();

        emitter.cancel = () => {};

        process.nextTick(() => {
          emitter.emit('data', data || {
            single_chan_backups: {
              chan_backups: [{
                chan_backup: Buffer.alloc(1),
                chan_point: {
                  funding_txid_bytes: Buffer.alloc(32),
                  output_index: 0,
                },
              }],
            },
            multi_chan_backup: {
              chan_points: [{
                funding_txid_bytes: Buffer.alloc(32),
                output_index: 0,
              }],
              multi_chan_backup: Buffer.alloc(1),
            },
          });

          emitter.emit('status', {status: 'status'});
          emitter.emit('end', {});
          emitter.emit('error', {details: 'Cancelled on client'});

          return;
        });

        return emitter;
      },
    },
  };
};

const tests = [
  {
    args: {},
    description: 'An LND object is required to subscribe to channels',
    error: 'ExpectedAuthenticatedLndToSubscribeToBackups',
  },
  {
    args: {lnd: makeLnd({data: 'data'})},
    description: 'An error event is triggered when getting an invalid backup',
    expected: {
      events: [
        {event: 'error', data: [503, 'ExpectedMultiChannelBackupInSnapshot']},
        {event: 'error', data: {details: 'Cancelled on client'}}
      ],
    },
  },
  {
    args: {lnd: makeLnd({})},
    description: 'Channel events are returned from channels subscription',
    expected: {
      events: [
        {
          event: 'backup',
          data: {
            backup: '00',
            channels: [{
              backup: '00',
              transaction_id: '0000000000000000000000000000000000000000000000000000000000000000',
              transaction_vout: 0,
            }],
          },
        },
        {event: 'error', data: {details: 'Cancelled on client'}},
      ],
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, match, strictSame, throws}) => {
    if (!!error) {
      throws(() => subscribeToBackups(args), new Error(error), 'Got error');
    } else {
      const events = [];
      const sub = subscribeToBackups(args);

      ['backup', 'error',].forEach(event => {
        return sub.on(event, data => events.push({event, data}));
      });

      await nextTick();

      sub.removeAllListeners('error');

      sub.removeAllListeners();

      const sub2 = subscribeToBackups(args);

      await nextTick();

      strictSame(events, expected.events);
    }

    return end();
  });
});
