const {test} = require('@alexbosworth/tap');

const {rpcChannelUpdateAsUpdate} = require('./../../lnd_responses');

const makeRoutingPolicy = overrides => {
  const policy = {
    disabled: false,
    fee_base_msat: '1',
    fee_rate_milli_msat: '1',
    max_htlc_msat: '1',
    min_htlc: '1',
    time_lock_delta: 1,
  };

  Object.keys(overrides).forEach(k => policy[k] = overrides[k]);

  return policy;
};

const makeArgs = overrides => {
  const args = {
    advertising_node: Buffer.alloc(33, 1).toString('hex'),
    capacity: '1',
    chan_id: 1,
    chan_point: {
      funding_txid_bytes: Buffer.from('0102', 'hex'),
      output_index: 1,
    },
    connecting_node: Buffer.alloc(33, 2).toString('hex'),
    routing_policy: makeRoutingPolicy({}),
  };

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const makeExpected = overrides => {
  const expected = {
    base_fee_mtokens: '1',
    capacity: 1,
    cltv_delta: 1,
    fee_rate: 1,
    id: '0x0x1',
    is_disabled: false,
    max_htlc_mtokens: '1',
    min_htlc_mtokens: '1',
    public_keys: [
      Buffer.alloc(33, 1).toString('hex'),
      Buffer.alloc(33, 2).toString('hex'),
    ],
    transaction_id: '0201',
    transaction_vout: 1,
  };

  Object.keys(overrides).forEach(k => expected[k] = overrides[k]);

  return expected;
};

const tests = [
  {
    args: undefined,
    description: 'An update is expected',
    error: 'ExpectedChannelUpdateDetails',
  },
  {
    args: makeArgs({advertising_node: undefined}),
    description: 'An advertising node is expected',
    error: 'ExpectedAnnouncingKey',
  },
  {
    args: makeArgs({capacity: undefined}),
    description: 'Channel capacity is expected',
    error: 'ExpectedChanCapacity',
  },
  {
    args: makeArgs({chan_id: undefined}),
    description: 'Channel id is expected',
    error: 'ExpectedChannelId',
  },
  {
    args: makeArgs({chan_id: 'chan_id'}),
    description: 'Valid channel id is expected',
    error: 'ExpectedValidChannelId',
  },
  {
    args: makeArgs({chan_point: undefined}),
    description: 'Channel funding outpoint is expected',
    error: 'ExpectedChanPoint',
  },
  {
    args: makeArgs({chan_point: {}}),
    description: 'Channel funding outpoint tx id is expected',
    error: 'ExpectedChanPointTxId',
  },
  {
    args: makeArgs({chan_point: {funding_txid_bytes: Buffer.alloc(32)}}),
    description: 'Channel funding outpoint tx vout is expected',
    error: 'ExpectedChanPointVout',
  },
  {
    args: makeArgs({connecting_node: undefined}),
    description: 'Channel funding outpoint tx vout is expected',
    error: 'ExpectedConnectingNode',
  },
  {
    args: makeArgs({routing_policy: undefined}),
    description: 'A routing policy is expected',
    error: 'ExpectedRoutingPolicy',
  },
  {
    args: makeArgs({routing_policy: makeRoutingPolicy({disabled: undefined})}),
    description: 'Routing policy disabled is expected',
    error: 'ExpectedDisabledStatus',
  },
  {
    args: makeArgs({
      routing_policy: makeRoutingPolicy({fee_base_msat: undefined}),
    }),
    description: 'Routing policy fee base msat is expected',
    error: 'ExpectedFeeBaseMsat',
  },
  {
    args: makeArgs({
      routing_policy: makeRoutingPolicy({fee_rate_milli_msat: undefined}),
    }),
    description: 'Routing policy fee rate is expected',
    error: 'ExpectedFeeRate',
  },
  {
    args: makeArgs({
      routing_policy: makeRoutingPolicy({max_htlc_msat: undefined}),
    }),
    description: 'Routing policy max htlc millitokens is expected',
    error: 'ExpectedMaxHtlcInChannelUpdate',
  },
  {
    args: makeArgs({
      routing_policy: makeRoutingPolicy({min_htlc: undefined}),
    }),
    description: 'Routing policy min htlc millitokens is expected',
    error: 'ExpectedMinHtlc',
  },
  {
    args: makeArgs({
      routing_policy: makeRoutingPolicy({time_lock_delta: undefined}),
    }),
    description: 'Routing policy min cltv delta is expected',
    error: 'ExpectedCltvDelta',
  },
  {
    args: makeArgs({}),
    description: 'RPC channel update is mapped to update',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({
      capacity: '0',
      chan_point: {funding_txid_bytes: Buffer.alloc(32), output_index: 0},
      routing_policy: makeRoutingPolicy({max_htlc_msat: '0'}),
    }),
    description: 'RPC channel update without details is mapped to update',
    expected: makeExpected({
      capacity: undefined,
      max_htlc_mtokens: undefined,
      transaction_id: undefined,
      transaction_vout: undefined,
    }),
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, ({end, equal, strictSame, throws}) => {
    if (!!error) {
      throws(() => rpcChannelUpdateAsUpdate(args), new Error(error), 'Error');
    } else {
      const update = rpcChannelUpdateAsUpdate(args);

      equal(!!update.updated_at, true, 'Has last updated date');

      delete update.updated_at;

      strictSame(update, expected, 'Channel update cast as update');
    }

    return end();
  });
});
