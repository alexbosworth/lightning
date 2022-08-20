const EventEmitter = require('events');
const {promisify} = require('util');

const {test} = require('@alexbosworth/tap');

const {subscribeToChannels} = require('./../../../');

const nextTick = promisify(process.nextTick);

const makeLnd = ({data, err}) => {
  return {
    default: {
      subscribeChannelEvents: ({}) => {
        const emitter = new EventEmitter();

        emitter.cancel = () => {};

        process.nextTick(() => {
          if (data !== undefined) {
            return emitter.emit('data', data);
          }

          emitter.emit('data', {data: {}, type: 'data'});

          emitter.emit('data', {
            active_channel: {
              funding_txid_bytes: Buffer.alloc(32),
              output_index: 0,
            },
            type: 'active_channel',
          });

          emitter.emit('data', {
            closed_channel: {
              alias_scids: [],
              capacity: '1',
              chan_id: '1',
              channel_point: '00:0',
              close_height: 1,
              closing_tx_hash: Buffer.alloc(32).toString('hex'),
              open_initiator: 'LOCAL',
              remote_pubkey: Buffer.alloc(33).toString('hex'),
              resolutions: [],
              settled_balance: '1',
              time_locked_balance: '1',
            },
            type: 'closed_channel',
          });

          emitter.emit('data', {
            inactive_channel: {
              funding_txid_bytes: Buffer.alloc(32),
              output_index: 0,
            },
            type: 'inactive_channel',
          });

          emitter.emit('data', {
            open_channel: {
              active: false,
              alias_scids: [],
              capacity: '1',
              chan_id: '1',
              channel_point: `${Buffer.alloc(32).toString('hex')}:0`,
              chan_status_flags: 'ChanStatusDefault',
              close_address: '',
              commit_fee: '1',
              commit_weight: '1',
              commitment_type: 'LEGACY',
              csv_delay: 1,
              fee_per_kw: '1',
              initiator: true,
              lifetime: 1,
              local_balance: '1',
              local_chan_reserve_sat: '1',
              local_constraints: {
                chan_reserve_sat: '1',
                csv_delay: 1,
                dust_limit_sat: '1',
                max_accepted_htlcs: 1,
                max_pending_amt_msat: '1',
                min_htlc_msat: '1',
              },
              num_updates: '1',
              pending_htlcs: [],
              private: false,
              push_amount_sat: '1',
              remote_balance: '1',
              remote_chan_reserve_sat: '1',
              remote_constraints: {
                chan_reserve_sat: '1',
                csv_delay: 1,
                dust_limit_sat: '1',
                max_accepted_htlcs: 1,
                max_pending_amt_msat: '1',
                min_htlc_msat: '1',
              },
              remote_pubkey: Buffer.alloc(33).toString('hex'),
              static_remote_key: false,
              thaw_height: 0,
              total_satoshis_received: '1',
              total_satoshis_sent: '1',
              unsettled_balance: '1',
              uptime: 1,
            },
            type: 'open_channel',
          });

          emitter.emit('data', {
            pending_open_channel: {
              funding_txid_bytes: Buffer.alloc(32),
              output_index: 0,
            },
            type: 'pending_open_channel',
          });

          emitter.emit('status', {status: 'status'});
          emitter.emit('end', {});
          emitter.emit('error', {details: 'Cancelled'});

          return;
        });

        return emitter;
      },
    },
    version: {
      getVersion: ({}, cbk) => cbk(err, {
        app_minor: 1,
        app_patch: 1,
        build_tags: ['autopilotrpc'],
        commit_hash: Buffer.alloc(20).toString('hex'),
      }),
    },
  };
};

const tests = [
  {
    args: {},
    description: 'An LND object is required to subscribe to channels',
    error: 'ExpectedAuthenticatedLndToSubscribeToChannels',
  },
  {
    args: {lnd: makeLnd({data: null})},
    description: 'Channel data is expected',
    expected: {
      events: [{
        data: new Error('ExpectedEventDetailsInChannelSubscription'),
        event: 'error',
      }],
    },
  },
  {
    args: {lnd: makeLnd({data: {}})},
    description: 'Channel data type is expected',
    expected: {
      events: [{
        data: new Error('ExpectedEventTypeInChannelSubscription'),
        event: 'error',
      }],
    },
  },
  {
    args: {lnd: makeLnd({data: {type: 1}})},
    description: 'Channel data type string is expected',
    expected: {
      events: [{
        data: new Error('ExpectedEventTypeInChannelSubscription'),
        event: 'error',
      }],
    },
  },
  {
    args: {lnd: makeLnd({data: {type: 'event'}})},
    description: 'Channel data details are expected',
    expected: {
      events: [{
        data: new Error('ExpectedEventDetailsForTypeInChannelSub'),
        event: 'error',
      }],
    },
  },
  {
    args: {lnd: makeLnd({data: {active_channel: {}, type: 'active_channel'}})},
    description: 'Channel data details are expected',
    expected: {
      events: [{
        data: new Error('ExpectedTransactionIdBufferForRpcOutpoint'),
        event: 'error',
      }],
    },
  },
  {
    args: {lnd: makeLnd({})},
    description: 'Channel events are returned from channels subscription',
    expected: {
      events: [
        {
          event: 'channel_active_changed',
          data: {
            is_active: true,
            transaction_id: '0000000000000000000000000000000000000000000000000000000000000000',
            transaction_vout: 0,
          },
        },
        {
          event: 'channel_closed',
          data: {
            capacity: 1,
            close_balance_spent_by: undefined,
            close_balance_vout: undefined,
            close_confirm_height: 1,
            close_payments: [],
            close_transaction_id: undefined,
            final_local_balance: 1,
            final_time_locked_balance: 1,
            id: '0x0x1',
            is_breach_close: false,
            is_cooperative_close: false,
            is_funding_cancel: false,
            is_local_force_close: false,
            is_partner_closed: undefined,
            is_partner_initiated: false,
            is_remote_force_close: false,
            other_ids: [],
            partner_public_key: '000000000000000000000000000000000000000000000000000000000000000000',
            transaction_id: '00',
            transaction_vout: 0,
          },
        },
        {
          event: 'channel_active_changed',
          data: {
            is_active: false,
            transaction_id: '0000000000000000000000000000000000000000000000000000000000000000',
            transaction_vout: 0,
          },
        },
        {
          event: 'channel_opened',
          data: {
            capacity: 1,
            commit_transaction_fee: 1,
            commit_transaction_weight: 1,
            cooperative_close_address: undefined,
            cooperative_close_delay_height: undefined,
            id: '0x0x1',
            is_active: false,
            is_closing: false,
            is_opening: false,
            is_partner_initiated: false,
            is_private: false,
            is_trusted_funding: undefined,
            local_balance: 1,
            local_csv: 1,
            local_dust: 1,
            local_given: 1,
            local_max_htlcs: 1,
            local_max_pending_mtokens: '1',
            local_min_htlc_mtokens: '1',
            local_reserve: 1,
            other_ids: [],
            partner_public_key: '000000000000000000000000000000000000000000000000000000000000000000',
            past_states: 1,
            pending_payments: [],
            received: 1,
            remote_balance: 1,
            remote_csv: 1,
            remote_dust: 1,
            remote_given: 0,
            remote_max_htlcs: 1,
            remote_max_pending_mtokens: '1',
            remote_min_htlc_mtokens: '1',
            remote_reserve: 1,
            sent: 1,
            time_offline: 0,
            time_online: 1000,
            transaction_id: '0000000000000000000000000000000000000000000000000000000000000000',
            transaction_vout: 0,
            unsettled_balance: 1,
          },
        },
        {
          event: 'channel_opening',
          data: {
            transaction_id: '0000000000000000000000000000000000000000000000000000000000000000',
            transaction_vout: 0,
          },
        },
        {
          data: {details: 'Cancelled'},
          event: 'error',
        },
      ],
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, equal, match, strictSame, throws}) => {
    if (!!error) {
      throws(() => subscribeToChannels(args), new Error(error), 'Got error');
    } else {
      const events = [];
      const sub = subscribeToChannels(args);

      [
        'channel_active_changed',
        'channel_closed',
        'channel_opened',
        'channel_opening',
        'error',
      ]
      .forEach(event => sub.on(event, data => events.push({event, data})));

      await nextTick();

      sub.removeAllListeners();

      const sub2 = subscribeToChannels(args);

      await nextTick();

      strictSame(events, expected.events);
    }

    return end();
  });
});
