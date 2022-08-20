const {test} = require('@alexbosworth/tap');

const {channelAcceptAsOpenRequest} = require('./../../lnd_responses');

const makeArgs = overrides => {
  const args = {
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
  };

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const tests = [
  {
    args: makeArgs({}),
    description: 'Channel accept is mapped to open request',
    expected: {
      capacity: 1,
      chain: Buffer.alloc(32).toString('hex'),
      commit_fee_tokens_per_vbyte: 4,
      csv_delay: 1,
      id: Buffer.alloc(32).toString('hex'),
      is_private: true,
      is_trusted_funding: false,
      local_balance: 1,
      local_reserve: 1,
      max_pending_mtokens: '1000',
      max_pending_payments: 1,
      min_chain_output: 1,
      min_htlc_mtokens: '1000',
      partner_public_key: Buffer.alloc(33, 3).toString('hex'),
    },
  },
  {
    description: 'Open request missing data',
    error: 'ExpectedRequestDataForChannelRequest',
  },
  {
    args: makeArgs({chain_hash: undefined}),
    description: 'Open request missing chain hash',
    error: 'ExpectedChainHashForChannelOpenRequest',
  },
  {
    args: makeArgs({channel_flags: undefined}),
    description: 'Open request missing channel flags',
    error: 'ExpectedChannelFlagsForChannelRequest',
  },
  {
    args: makeArgs({channel_reserve: undefined}),
    description: 'Open request missing channel reserve',
    error: 'ExpectedChannelReserveForChannelRequest',
  },
  {
    args: makeArgs({csv_delay: undefined}),
    description: 'Open request missing csv delay',
    error: 'ExpectedCsvDelayInChannelOpenRequest',
  },
  {
    args: makeArgs({dust_limit: undefined}),
    description: 'Open request missing dust limit',
    error: 'ExpectedDustLimitInChannelOpenRequest',
  },
  {
    args: makeArgs({fee_per_kw: undefined}),
    description: 'Open request missing fee per kw',
    error: 'ExpectedFeePerKwForChannelOpenRequest',
  },
  {
    args: makeArgs({funding_amt: undefined}),
    description: 'Open request missing funding amount',
    error: 'ExpectedFundingAmountForChannelRequest',
  },
  {
    args: makeArgs({max_accepted_htlcs: undefined}),
    description: 'Open request missing max accepted htlcs',
    error: 'ExpectedMaxAcceptedHtlcsForChannelRequest',
  },
  {
    args: makeArgs({max_value_in_flight: undefined}),
    description: 'Open request missing max value in flight',
    error: 'ExpectedMaxValueInFlightForChannelRequest',
  },
  {
    args: makeArgs({min_htlc: undefined}),
    description: 'Open request missing minimum HTLC size',
    error: 'ExpectedMinimumHtlcSizeForChannelRequest',
  },
  {
    args: makeArgs({node_pubkey: undefined}),
    description: 'Open request missing node public key',
    error: 'ExpectedNodePublicKeyInRequestData',
  },
  {
    args: makeArgs({node_pubkey: Buffer.alloc(1)}),
    description: 'Open request missing node public key',
    error: 'UnexpectedPublicKeyLengthInChanRequest',
  },
  {
    args: makeArgs({pending_chan_id: undefined}),
    description: 'Open request missing pending channel id',
    error: 'ExpectedPendingChannelIdInRequestData',
  },
  {
    args: makeArgs({push_amt: undefined}),
    description: 'Open request missing push amount',
    error: 'ExpectedChannelPushAmountInRequestData',
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, ({end, equal, strictSame, throws}) => {
    if (!!error) {
      throws(() => channelAcceptAsOpenRequest(args), new Error(error), 'Err');
    } else {
      const res = channelAcceptAsOpenRequest(args);

      strictSame(res, expected, 'Got expected result');
    }

    return end();
  });
});
