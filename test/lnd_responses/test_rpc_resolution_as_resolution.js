const {test} = require('@alexbosworth/tap');

const {rpcResolutionAsResolution} = require('./../../lnd_responses');

const makeArgs = overrides => {
  const args = {
    amount_sat: '1',
    outcome: 'CLAIMED',
    outpoint: {
      output_index: 0,
      txid_str: Buffer.alloc(32).toString('hex'),
    },
    resolution_type: 'INCOMING_HTLC',
    sweep_txid: Buffer.alloc(32, 1).toString('hex'),
  };

  Object.keys(overrides || {}).forEach(key => args[key] = overrides[key]);

  return args;
};

const makeExpected = overrides => {
  const payment = {
    is_outgoing: false,
    is_paid: true,
    is_pending: false,
    is_refunded: false,
    spent_by: Buffer.alloc(32, 1).toString('hex'),
    tokens: 1,
    transaction_id: Buffer.alloc(32).toString('hex'),
    transaction_vout: 0,
  };

  Object.keys(overrides || {}).forEach(key => payment[key] = overrides[key]);

  return {payment};
};

const tests = [
  {
    description: 'RPC resolution is expected',
    error: 'ExpectedRpcResolutionMessageToDeriveResolution',
  },
  {
    args: makeArgs({amount_sat: undefined}),
    description: 'Tokens are expected',
    error: 'ExpectedAmountSpentToInRpcResolutionMessage',
  },
  {
    args: makeArgs({outcome: undefined}),
    description: 'Outcome is expected',
    error: 'ExpectedResolutionOutcomeInRpcResolutionMessage',
  },
  {
    args: makeArgs({outpoint: undefined}),
    description: 'An outpoint is expected',
    error: 'ExpectedResolutionOutpointInRpcResolutionMessage',
  },
  {
    args: makeArgs({outpoint: {txid_str: Buffer.alloc(32).toString('hex')}}),
    description: 'An outpoint vout is expected',
    error: 'ExpectedResolutionOutpointVoutInRpcResolutionMessage',
  },
  {
    args: makeArgs({outpoint: {output_index: 0}}),
    description: 'An outpoint tx id is expected',
    error: 'ExpectedResolutionOutpointTxIdInRpcResolutionMessage',
  },
  {
    args: makeArgs({resolution_type: undefined}),
    description: 'A resolution type is expected',
    error: 'ExpectedResolutionTypeInRpcResolutionMessage',
  },
  {
    args: makeArgs({sweep_txid: '00'}),
    description: 'A sweep transaction id is expected',
    error: 'ExpectedSweepTransactionIdInRpcResolutionMessage',
  },
  {
    args: makeArgs({}),
    description: 'RPC payment resolution is mapped to payment resolution',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({sweep_txid: ''}),
    description: 'RPC payment resolution does not require a sweep tx id',
    expected: makeExpected({spent_by: undefined}),
  },
  {
    args: makeArgs({resolution_type: 'UNKNOWN'}),
    description: 'Only known resolution types are mapped to resolutions',
    expected: {},
  },
  {
    args: makeArgs({resolution_type: 'COMMIT', sweep_txid: ''}),
    description: 'RPC balance resolution expects a sweep tx id',
    expected: {},
  },
  {
    args: makeArgs({outcome: 'TIMEOUT', resolution_type: 'COMMIT'}),
    description: 'RPC balance resolution expects a claimed amount',
    expected: {},
  },
  {
    args: makeArgs({resolution_type: 'COMMIT'}),
    description: 'RPC balance resolution is mapped to balance',
    expected: {
      balance: {
        spent_by: Buffer.alloc(32, 1).toString('hex'),
        transaction_vout: 0,
      },
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, ({end, strictSame, throws}) => {
    if (!!error) {
      throws(() => rpcResolutionAsResolution(args), new Error(error), 'Err');
    } else {
      strictSame(rpcResolutionAsResolution(args), expected, 'RPC res mapped');
    }

    return end();
  });
});
