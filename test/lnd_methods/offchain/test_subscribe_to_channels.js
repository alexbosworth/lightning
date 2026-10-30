const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

const {subscribeToChannels} = require('./../../../');
const {subscriptionEvents} = require('./../macros');

const eventActive = 'channel_active_changed';
const events = [
  'channel_active_changed',
  'channel_closed',
  'channel_opened',
  'channel_opening',
  'end',
  'error',
  'status',
];
const listenerFailure = {event: 'error', data: [503, 'ListenerFailure']};

// Updates that the mock LND sends on the channel events stream
const active = {
  active_channel: {
    funding_txid_bytes: Buffer.alloc(32),
    output_index: 0,
  },
  type: 'active_channel',
};

const closed = {
  closed_channel: {
    alias_scids: [],
    capacity: '1',
    chan_id: '1',
    channel_point: '00:0',
    close_height: 1,
    closing_tx_hash: Buffer.alloc(32).toString('hex'),
    open_initiator: 'INITIATOR_LOCAL',
    remote_pubkey: Buffer.alloc(33).toString('hex'),
    resolutions: [],
    settled_balance: '1',
    time_locked_balance: '1',
  },
  type: 'closed_channel',
};

const inactive = {
  inactive_channel: {
    funding_txid_bytes: Buffer.alloc(32),
    output_index: 0,
  },
  type: 'inactive_channel',
};

const open = {
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
    commitment_type: 'ANCHORS',
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
};

const pendingOpen = {
  pending_open_channel: {
    funding_txid_bytes: Buffer.alloc(32),
    output_index: 0,
  },
  type: 'pending_open_channel',
};

const defaultStream = [
  ['data', {data: {}, type: 'data'}],
  ['data', active],
  ['data', closed],
  ['data', inactive],
  ['data', open],
  ['data', pendingOpen],
  ['status', {status: 'status'}],
  ['end'],
  ['error', {details: 'Cancelled'}],
];

// Events emitted for the updates of the default stream
const happyEvents = [
  {
    event: 'channel_active_changed',
    data: {
      is_active: true,
      transaction_id: Buffer.alloc(32).toString('hex'),
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
      partner_public_key: Buffer.alloc(33).toString('hex'),
      transaction_id: '00',
      transaction_vout: 0,
    },
  },
  {
    event: 'channel_active_changed',
    data: {
      is_active: false,
      transaction_id: Buffer.alloc(32).toString('hex'),
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
      description: undefined,
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
      partner_public_key: Buffer.alloc(33).toString('hex'),
      partner_scid_alias: undefined,
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
      transaction_id: Buffer.alloc(32).toString('hex'),
      transaction_vout: 0,
      type: 'anchor',
      unsettled_balance: 1,
    },
  },
  {
    event: 'channel_opening',
    data: {
      transaction_id: Buffer.alloc(32).toString('hex'),
      transaction_vout: 0,
    },
  },
];

const makeClosedStream = overrides => {
  const closedChannel = {
    alias_scids: [],
    capacity: '1',
    chan_id: '1',
    channel_point: '00:0',
    close_height: 1,
    close_initiator: 'INITIATOR_UNKNOWN',
    close_type: 'COOPERATIVE_CLOSE',
    closing_tx_hash: Buffer.alloc(32).toString('hex'),
    open_initiator: 'INITIATOR_UNKNOWN',
    remote_pubkey: Buffer.alloc(33).toString('hex'),
    resolutions: [],
    settled_balance: '1',
    time_locked_balance: '1',
  };

  Object.keys(overrides).forEach(k => closedChannel[k] = overrides[k]);

  const data = {closed_channel: closedChannel, type: 'closed_channel'};

  return [['data', data]];
};

const makeClosedExpected = overrides => {
  const data = {
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
    is_cooperative_close: true,
    is_funding_cancel: false,
    is_local_force_close: false,
    is_partner_closed: undefined,
    is_partner_initiated: undefined,
    is_remote_force_close: false,
    other_ids: [],
    partner_public_key: Buffer.alloc(33).toString('hex'),
    transaction_id: '00',
    transaction_vout: 0,
  };

  Object.keys(overrides).forEach(k => data[k] = overrides[k]);

  return {events: [{data, event: 'channel_closed'}]};
};

const tests = [
  {
    args: {},
    description: 'An LND object is required to subscribe to channels',
    error: 'ExpectedAuthenticatedLndToSubscribeToChannels',
  },
  {
    args: {},
    description: 'Channel data is expected',
    expected: {
      cancels: ['cancel'],
      events: [{
        data: new Error('ExpectedEventDetailsInChannelSubscription'),
        event: 'error',
      }],
    },
    stream: [['data', null]],
  },
  {
    args: {},
    description: 'Channel updates without a type are ignored',
    expected: {events: []},
    stream: [['data', {}]],
  },
  {
    args: {},
    description: 'Channel updates with an unknown type shape are ignored',
    expected: {events: []},
    stream: [['data', {type: 1}]],
  },
  {
    args: {},
    description: 'Channel updates without details are ignored',
    expected: {events: []},
    stream: [['data', {type: 'open_channel'}]],
  },
  {
    args: {},
    description: 'Channel data details are expected',
    expected: {
      cancels: ['cancel'],
      events: [{
        data: new Error('ExpectedTransactionIdBufferForRpcOutpoint'),
        event: 'error',
      }],
    },
    stream: [['data', {active_channel: {}, type: 'active_channel'}]],
  },
  {
    args: {},
    description: 'Channel events are returned from channels subscription',
    expected: {
      events: [].concat(happyEvents).concat([
        {event: 'status', data: {status: 'status'}},
        {event: 'end', data: undefined},
        {event: 'error', data: {details: 'Cancelled'}},
      ]),
    },
  },
  {
    args: {},
    description: 'Local cooperative close event is not partner closed',
    expected: makeClosedExpected({is_partner_closed: false}),
    stream: makeClosedStream({close_initiator: 'INITIATOR_LOCAL'}),
  },
  {
    args: {},
    description: 'Remote cooperative close event is partner closed',
    expected: makeClosedExpected({is_partner_closed: true}),
    stream: makeClosedStream({close_initiator: 'INITIATOR_REMOTE'}),
  },
  {
    args: {},
    description: 'Cooperative close event by both sides has undefined closer',
    expected: makeClosedExpected({is_partner_closed: undefined}),
    stream: makeClosedStream({close_initiator: 'INITIATOR_BOTH'}),
  },
  {
    args: {},
    description: 'Cooperative close event by unknown side has no closer',
    expected: makeClosedExpected({is_partner_closed: undefined}),
    stream: makeClosedStream({close_initiator: 'INITIATOR_UNKNOWN'}),
  },
  {
    args: {},
    description: 'Close event for a local open is not partner initiated',
    expected: makeClosedExpected({is_partner_initiated: false}),
    stream: makeClosedStream({open_initiator: 'INITIATOR_LOCAL'}),
  },
  {
    args: {},
    description: 'Close event for a remote open is partner initiated',
    expected: makeClosedExpected({is_partner_initiated: true}),
    stream: makeClosedStream({open_initiator: 'INITIATOR_REMOTE'}),
  },
  {
    args: {},
    description: 'Stream errors are ignored without an error listener',
    expected: {cancels: ['cancel'], events: []},
    listening: [eventActive],
    stream: [['error', {details: 'err'}]],
  },
  {
    args: {},
    description: 'A throwing listener is reported without ending the stream',
    expected: {
      events: [
        happyEvents[0],
        listenerFailure,
        happyEvents[1],
        happyEvents[2],
        listenerFailure,
        happyEvents[3],
        happyEvents[4],
        {event: 'status', data: {status: 'status'}},
        {event: 'end', data: undefined},
        {event: 'error', data: {details: 'Cancelled'}},
      ],
    },
    throwing: [eventActive],
  },
  {
    args: {},
    description: 'Removing the last channel listener cancels the stream',
    expected: {cancels: ['cancel'], events: []},
    removing: [
      'end',
      'channel_closed',
      'channel_opened',
      'channel_opening',
      eventActive,
    ],
    stream: [],
  },
];

tests.forEach(({args, description, error, expected, ...scenario}) => {
  return test(description, async () => {
    if (!!error) {
      throws(() => subscribeToChannels(args), new Error(error), 'Got error');

      return;
    }

    const got = await subscriptionEvents({
      ...scenario,
      events,
      stream: scenario.stream || defaultStream,
      subscribe: stream => {
        args.lnd = {default: {subscribeChannelEvents: () => stream}};

        return subscribeToChannels(args);
      },
    });

    deepStrictEqual(got, {cancels: [], ...expected}, 'Got expected events');

    return;
  });
});
