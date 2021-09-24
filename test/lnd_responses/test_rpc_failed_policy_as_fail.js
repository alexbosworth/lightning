const {test} = require('@alexbosworth/tap');

const {rpcFailedPolicyAsFail} = require('./../../lnd_responses');

const makeArgs = override => {
  const args = {
    outpoint: {
      txid_bytes: Buffer.alloc(32),
      output_index: 0,
    },
    reason: 'reason',
    update_error: 'description',
  };

  Object.keys(override).forEach(key => args[key] = override[key]);

  return args;
};

const tests = [
  {
    args: null,
    description: 'Rpc failure is required to derive failure details',
    error: 'ExpectedPolicyFailureToDeriveFailureDetails',
  },
  {
    args: makeArgs({outpoint: undefined}),
    description: 'A funding tx outpoint is expected',
    error: 'ExpectedFundingTransactionOutpointForPolicyFailDetails',
  },
  {
    args: makeArgs({outpoint: {}}),
    description: 'Funding tx bytes are expected',
    error: 'ExpectedFundingTxIdBytesForPolicyFailDetails',
  },
  {
    args: makeArgs({outpoint: {txid_bytes: Buffer.alloc(32)}}),
    description: 'Funding tx output index is expected',
    error: 'ExpectedFundingTxOutputIndexForPolicyFailDetails',
  },
  {
    args: makeArgs({}),
    description: 'RPC policy fail is mapped to update fail',
    expected: {
      failure: 'description',
      is_pending_channel: false,
      is_unknown_channel: false,
      is_invalid_policy: false,
      transaction_id: '0000000000000000000000000000000000000000000000000000000000000000',
      transaction_vout: 0,
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(({end, strictSame, throws}) => {
    if (!!error) {
      throws(() => rpcFailedPolicyAsFail(args), new Error(error), 'Got error');
    } else {
      const res = rpcFailedPolicyAsFail(args);

      strictSame(res, expected, 'Got expected details');
    }

    return end();
  });
});
