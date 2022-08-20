const EventEmitter = require('events');
const {promisify} = require('util');

const {test} = require('@alexbosworth/tap');

const {subscribeToOpenRequests} = require('./../../../');

const nextTick = promisify(process.nextTick);

const makeLnd = ({data, err}) => {
  return {
    default: {
      channelAcceptor: ({}) => {
        const emitter = new EventEmitter();

        emitter.cancel = () => {};
        emitter.write = () => {};

        process.nextTick(() => {
          emitter.emit('data', data || {
            chain_hash: Buffer.alloc(32),
            channel_flags: 34,
            channel_reserve: '1',
            csv_delay: 1,
            dust_limit: '1',
            fee_per_kw: '1000',
            funding_amt: '1',
            max_accepted_htlcs: 1,
            max_value_in_flight: '1000',
            min_htlc: '1000',
            node_pubkey: Buffer.alloc(33, 3),
            pending_chan_id: Buffer.alloc(32),
            push_amt: '1000',
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
    description: 'An LND object is required to subscribe to open requests',
    error: 'ExpectedLndToSubscribeToChannelRequests',
  },
  {
    args: {lnd: makeLnd({data: 'data'})},
    description: 'An error event is triggered when getting an invalid request',
    expected: {
      events: [
        {
          event: 'error',
          data: [503, 'ExpectedChainHashForChannelOpenRequest']
        },
        {
          event: 'error',
          data: {details: 'Cancelled on client'},
        },
      ],
    },
  },
  {
    args: {lnd: makeLnd({})},
    description: 'Channel open request events are returned',
    expected: {
      events: [
        {
          event: 'channel_request',
          data: {
            capacity: 1,
            chain: '0000000000000000000000000000000000000000000000000000000000000000',
            commit_fee_tokens_per_vbyte: 4,
            csv_delay: 1,
            id: '0000000000000000000000000000000000000000000000000000000000000000',
            is_private: true,
            is_trusted_funding: false,
            local_balance: 1,
            local_reserve: 1,
            max_pending_mtokens: '1000',
            max_pending_payments: 1,
            min_chain_output: 1,
            min_htlc_mtokens: '1000',
            partner_public_key: '030303030303030303030303030303030303030303030303030303030303030303',
          }
        },
        {event: 'error', data: {details: 'Cancelled on client'}},
      ],
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, equal, match, strictSame, throws}) => {
    if (!!error) {
      throws(() => subscribeToOpenRequests(args), new Error(error), 'Got err');
    } else {
      const events = [];
      const sub = subscribeToOpenRequests(args);

      ['channel_request', 'error',].forEach(event => {
        return sub.on(event, data => events.push({event, data}));
      });

      await nextTick();

      sub.removeAllListeners('error');

      sub.removeAllListeners();

      const sub2 = subscribeToOpenRequests(args);

      await nextTick();

      events.forEach(event => {
        if (!!event.data && !!event.data.accept) {
          event.data.accept();
          event.data.reject();

          event.data.accept({});
          event.data.reject({});

          delete event.data.accept;
          delete event.data.reject;
        }
      });

      strictSame(events, expected.events);
    }

    return end();
  });
});
