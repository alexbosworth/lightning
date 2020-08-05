const {test} = require('tap');

const rpcHtlcAsPayment = require('./../../lnd_responses/rpc_htlc_as_payment');

const makeInput = overrides => {
  const response = {
    amount: '1',
    expiration_height: 1,
    hash_lock: Buffer.alloc(32),
    incoming: true,
  };

  Object.keys(overrides || {}).forEach(key => response[key] = overrides[key]);

  return response;
};


const makeExpected = overrides => {
  const expected = {
    id: Buffer.alloc(32).toString('hex'),
    is_outgoing: false,
    timeout: 1,
    tokens: 1,
  };

  Object.keys(overrides || {}).forEach(key => expected[key] = overrides[key]);

  return expected;
};

const tests = [
  {
    description: 'HTLC payment is expected',
    error: 'ExpectedHtlcInHtlcMessage',
  },
  {
    args: makeInput({amount: undefined}),
    description: 'Tokens are expected',
    error: 'ExpectedTokensAmountInHtlcMessage',
  },
  {
    args: makeInput({expiration_height: undefined}),
    description: 'Expiration height is expected',
    error: 'ExpectedExpirationHeightInHtlcMessage',
  },
  {
    args: makeInput({hash_lock: undefined}),
    description: 'Hash lock is expected',
    error: 'ExpectedPaymentHashInHtlcMessage',
  },
  {
    args: makeInput({incoming: undefined}),
    description: 'Incoming is expected',
    error: 'ExpectedBooleanIncomingStateInHtlcMessage',
  },
  {
    args: makeInput({}),
    description: 'HTLC is mapped to payment',
    expected: makeExpected({}),
  },
  {
    args: makeInput({incoming: false}),
    description: 'HTLC is mapped to payment',
    expected: makeExpected({is_outgoing: true}),
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, ({deepEqual, end, throws}) => {
    if (!!error) {
      throws(() => rpcHtlcAsPayment(args), new Error(error), 'Got err');
    } else {
      deepEqual(rpcHtlcAsPayment(args), expected, 'Mapped to payment');
    }

    return end();
  });
});
