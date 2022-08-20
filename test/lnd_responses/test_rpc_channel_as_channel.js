const {test} = require('@alexbosworth/tap');

const {rpcChannelAsChannel} = require('./../../lnd_responses');

const makeArgs = overrides => {
  const args = {
    active: true,
    alias_scids: [],
    capacity: '1',
    chan_id: '1',
    channel_point: '00:1',
    chan_status_flags: '1',
    close_address: undefined,
    commit_fee: '1',
    commit_weight: '1',
    commitment_type: 'LEGACY',
    csv_delay: 1,
    fee_per_kw: '1',
    initiator: false,
    lifetime: 1,
    local_balance: '1',
    local_chan_reserve_sat: '0',
    local_constraints: {
      chan_reserve_sat: '1',
      csv_delay: 1,
      dust_limit_sat: '1',
      max_accepted_htlcs: 1,
      max_pending_amt_msat: '1',
      min_htlc_msat: '1',
    },
    num_updates: '1',
    pending_htlcs: [{
      amount: '1',
      expiration_height: 1,
      hash_lock: Buffer.alloc(32),
      incoming: true,
    }],
    private: true,
    push_amount_sat: '0',
    remote_balance: '1',
    remote_chan_reserve_sat: '0',
    remote_constraints: {
      chan_reserve_sat: '1',
      csv_delay: 1,
      dust_limit_sat: '1',
      max_accepted_htlcs: 1,
      max_pending_amt_msat: '1',
      min_htlc_msat: '1',
    },
    remote_pubkey: '00',
    static_remote_key: false,
    thaw_height: 0,
    total_satoshis_received: '1',
    total_satoshis_sent: '1',
    unsettled_balance: '1',
    uptime: 1,
  };

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const makeExpected = overrides => {
  const expected = {
    capacity: 1,
    commit_transaction_fee: 1,
    commit_transaction_weight: 1,
    cooperative_close_address: undefined,
    cooperative_close_delay_height: undefined,
    id: '0x0x1',
    is_active: true,
    is_closing: false,
    is_opening: false,
    is_partner_initiated: true,
    is_private: true,
    is_trusted_funding: undefined,
    local_balance: 1,
    local_csv: 1,
    local_dust: 1,
    local_given: 0,
    local_max_htlcs: 1,
    local_max_pending_mtokens: '1',
    local_min_htlc_mtokens: '1',
    local_reserve: 1,
    other_ids: [],
    partner_public_key: '00',
    past_states: 1,
    pending_payments: [{
      id: '0000000000000000000000000000000000000000000000000000000000000000',
      in_channel: undefined,
      in_payment: undefined,
      is_forward: undefined,
      is_outgoing: false,
      out_channel: undefined,
      out_payment: undefined,
      payment: undefined,
      timeout: 1,
      tokens: 1,
    }],
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
    transaction_id: '00',
    transaction_vout: 1,
    unsettled_balance: 1,
  };

  Object.keys(overrides).forEach(k => expected[k] = overrides[k]);

  return expected;
};

const tests = [
  {
    args: makeArgs({active: undefined}),
    description: 'Channel active is expected',
    error: 'ExpectedChannelActiveStateInChannelMessage',
  },
  {
    args: makeArgs({alias_scids: undefined}),
    description: 'Alias scids are expected',
    error: 'ExpectedArrayOfAliasShortChannelIdsInChannelMessage',
  },
  {
    args: makeArgs({capacity: undefined}),
    description: 'Channel capacity is expected',
    error: 'ExpectedChannelCapacityInChannelMessage',
  },
  {
    args: makeArgs({chan_id: undefined}),
    description: 'Channel id is expected',
    error: 'ExpectedChannelIdNumberInChannelsList',
  },
  {
    args: makeArgs({channel_point: undefined}),
    description: 'Channel point is expected',
    error: 'ExpectedChannelPointInChannelMessage',
  },
  {
    args: makeArgs({commit_fee: undefined}),
    description: 'Channel commit fee is expected',
    error: 'ExpectedCommitFeeInChannelMessage',
  },
  {
    args: makeArgs({commit_weight: undefined}),
    description: 'Channel commit weight is expected',
    error: 'ExpectedCommitWeightInChannelMessage',
  },
  {
    args: makeArgs({fee_per_kw: undefined}),
    description: 'Channel fee per kw is expected',
    error: 'ExpectedFeePerKwInChannelMessage',
  },
  {
    args: makeArgs({local_balance: undefined}),
    description: 'Local balance is expected',
    error: 'ExpectedLocalBalanceInChannelMessage',
  },
  {
    args: makeArgs({local_chan_reserve_sat: undefined}),
    description: 'Local chan reserve is expected',
    error: 'ExpectedLocalChannelReserveAmountInChannelMessage',
  },
  {
    args: makeArgs({local_constraints: undefined}),
    description: 'Local constraints are expected',
    error: 'ExpectedLocalChannelConstraintsInChannelMessage',
  },
  {
    args: makeArgs({num_updates: undefined}),
    description: 'Channel update count is expected',
    error: 'ExpectedNumUpdatesInChannelMessage',
  },
  {
    args: makeArgs({pending_htlcs: undefined}),
    description: 'Pending HTLCs array is expected',
    error: 'ExpectedChannelPendingHtlcsInChannelMessage',
  },
  {
    args: makeArgs({private: undefined}),
    description: 'Private status is expected',
    error: 'ExpectedChannelPrivateStatusInChannelMessage',
  },
  {
    args: makeArgs({remote_balance: undefined}),
    description: 'Remote balance is expected',
    error: 'ExpectedRemoteBalanceInChannelMessage',
  },
  {
    args: makeArgs({remote_chan_reserve_sat: undefined}),
    description: 'Remote channel reserve is expected',
    error: 'ExpectedRemoteChannelReserveAmountInChannelMessage',
  },
  {
    args: makeArgs({remote_constraints: undefined}),
    description: 'Remote constraints are expected',
    error: 'ExpectedRemoteChannelConstraintsInChannelMessage',
  },
  {
    args: makeArgs({remote_pubkey: undefined}),
    description: 'Remote public key is expected',
    error: 'ExpectedRemotePubkeyInChannelMessage',
  },
  {
    args: makeArgs({thaw_height: undefined}),
    description: 'Channel thaw height is expected',
    error: 'ExpectedCooperativeCloseThawHeightInChannelMessage',
  },
  {
    args: makeArgs({total_satoshis_received: undefined}),
    description: 'Total satoshis received is expected',
    error: 'ExpectedTotalSatoshisReceivedInChannelMessage',
  },
  {
    args: makeArgs({total_satoshis_sent: undefined}),
    description: 'Total satoshis received is expected',
    error: 'ExpectedTotalSatoshisSentInChannelMessage',
  },
  {
    args: makeArgs({unsettled_balance: undefined}),
    description: 'Unsettled balance is expected',
    error: 'ExpectedUnsettledBalanceInChannelMessage',
  },
  {
    args: makeArgs({}),
    description: 'RPC channel is mapped to channel',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({alias_scids: ['2', '3'], zero_conf_confirmed_scid: '2'}),
    description: 'RPC channel is mapped to channel with scids',
    expected: makeExpected({id: '0x0x2', other_ids: ['0x0x3']}),
  },
  {
    args: makeArgs({commitment_type: 'STATIC_REMOTE_KEY', initiator: true}),
    description: 'Initiated RPC channel is mapped to channel',
    expected: makeExpected({
      is_partner_initiated: false,
    }),
  },
  {
    args: makeArgs({
      commitment_type: 'ANCHORS',
      local_constraints: {
        chan_reserve_sat: '1',
        csv_delay: 1,
        dust_limit_sat: '1',
        max_accepted_htlcs: 1,
        max_pending_amt_msat: '1',
        min_htlc_msat: '1',
      },
      remote_constraints: {
        chan_reserve_sat: '2',
        csv_delay: 2,
        dust_limit_sat: '2',
        max_accepted_htlcs: 2,
        max_pending_amt_msat: '2',
        min_htlc_msat: '2',
      },
    }),
    description: 'Local constraints RPC channel is mapped to channel',
    expected: makeExpected({
      local_csv: 1,
      local_dust: 1,
      local_max_htlcs: 1,
      local_max_pending_mtokens: '1',
      local_min_htlc_mtokens: '1',
      local_reserve: 1,
      remote_csv: 2,
      remote_dust: 2,
      remote_max_htlcs: 2,
      remote_max_pending_mtokens: '2',
      remote_min_htlc_mtokens: '2',
      remote_reserve: 2,
    }),
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, ({end, strictSame, throws}) => {
    if (!!error) {
      throws(() => rpcChannelAsChannel(args), new Error(error), 'Got error');
    } else {
      const channel = rpcChannelAsChannel(args);

      strictSame(channel, expected, 'Channel cast as channel');
    }

    return end();
  });
});
