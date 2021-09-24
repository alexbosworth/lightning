const {test} = require('@alexbosworth/tap');

const {rpcFeesAsChannelFees} = require('./../../lnd_responses');

const makeArgs = override => {
  const args = {
    base_fee_msat: '1',
    chan_id: '1',
    channel_point: `${Buffer.alloc(32).toString('hex')}:0`,
    fee_per_mil: '0',
  };

  Object.keys(override).forEach(key => args[key] = override[key]);

  return args;
};

const tests = [
  {
    args: null,
    description: 'Rpc fees are needed to map to channel fees',
    error: 'ExpectedRpcChannelPolicyToDeriveChannelFees',
  },
  {
    args: makeArgs({base_fee_msat: undefined}),
    description: 'Base fee msat is expected',
    error: 'ExpectedBaseFeeForChannel',
  },
  {
    args: makeArgs({chan_id: undefined}),
    description: 'A channel id is expected',
    error: 'ExpectedIdOrNumberToFormatAsChannelComponents',
  },
  {
    args: makeArgs({channel_point: undefined}),
    description: 'A channel point is expected',
    error: 'ExpectedChannelPoint',
  },
  {
    args: makeArgs({channel_point: 'channel_point'}),
    description: 'A channel outpoint is expected',
    error: 'UnexpectedChannelPointFormat',
  },
  {
    args: makeArgs({channel_point: ':0'}),
    description: 'A channel funding transaction id is expected',
    error: 'ExpectedChannelPointTransactionId',
  },
  {
    args: makeArgs({channel_point: `${Buffer.alloc(32).toString('hex')}:`}),
    description: 'A channel funding transaction vout is expected',
    error: 'ExpectedChannelPointIndex',
  },
  {
    args: makeArgs({fee_per_mil: undefined}),
    description: 'A fee rate is expected',
    error: 'ExpectedFeeRatePerMillion',
  },
  {
    args: makeArgs({}),
    description: 'RPC channel fees are mapped to channel fees',
    expected: {
      base_fee: 0,
      base_fee_mtokens: '1',
      fee_rate: 0,
      id: '0x0x1',
      transaction_id: Buffer.alloc(32).toString('hex'),
      transaction_vout: 0,
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(({end, strictSame, throws}) => {
    if (!!error) {
      throws(() => rpcFeesAsChannelFees(args), new Error(error), 'Got error');
    } else {
      const res = rpcFeesAsChannelFees(args);

      strictSame(res, expected, 'Got expected details');
    }

    return end();
  });
});
