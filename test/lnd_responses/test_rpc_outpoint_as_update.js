const {test} = require('@alexbosworth/tap');

const {rpcOutpointAsUpdate} = require('./../../lnd_responses');

const makeInfo = overrides => {
  const details = {funding_txid_bytes: Buffer.alloc(32), output_index: 0};

  Object.keys(overrides || {}).forEach(key => details[key] = overrides[key]);

  return details;
};

const makeExpected = overrides => {
  const expected = {
    transaction_id: Buffer.alloc(32).toString('hex'),
    transaction_vout: 0,
  };

  Object.keys(overrides || {}).forEach(key => expected[key] = overrides[key]);

  return expected;
};

const tests = [
  {
    description: 'Outpoint info is expected',
    error: 'ExpectedUpdateDetailsForRpcOutpointUpdate',
  },
  {
    args: makeInfo({funding_txid_bytes: undefined}),
    description: 'Funding transaction id bytes are expected',
    error: 'ExpectedTransactionIdBufferForRpcOutpoint',
  },
  {
    args: makeInfo({output_index: undefined}),
    description: 'Funding transaction output indexes are expected',
    error: 'ExpectedOutputIndexForRpcOutpoint',
  },
  {
    args: makeInfo({}),
    description: 'Outpoint details are mapped',
    expected: makeExpected({}),
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, ({end, strictSame, throws}) => {
    if (!!error) {
      throws(() => rpcOutpointAsUpdate(args), new Error(error), 'Got error');
    } else {
      strictSame(rpcOutpointAsUpdate(args), expected, 'Outpoint info mapped');
    }

    return end();
  });
});
