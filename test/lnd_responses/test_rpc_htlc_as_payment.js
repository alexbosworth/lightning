const {test} = require('@alexbosworth/tap');

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
    in_channel: undefined,
    in_payment: undefined,
    is_forward: undefined,
    is_outgoing: false,
    out_channel: undefined,
    out_payment: undefined,
    payment: undefined,
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
    args: makeInput({forwarding_channel: new Date()}),
    description: 'Channel number is expected',
    error: 'ExpectedValidChannelIdForHtlcForwardPairChannel',
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
  {
    args: makeInput({
      forwarding_channel: '1',
      forwarding_htlc_index: '1',
      htlc_index: '1',
    }),
    description: 'Incoming forward HTLC is mapped to payment',
    expected: makeExpected({
      is_forward: true,
      out_channel: '0x0x1',
      out_payment: 1,
      payment: 1,
    }),
  },
  {
    args: makeInput({
      forwarding_channel: '1',
      forwarding_htlc_index: '1',
      htlc_index: '1',
      incoming: false,
    }),
    description: 'Outoing forward HTLC is mapped to payment',
    expected: makeExpected({
      in_channel: '0x0x1',
      in_payment: 1,
      is_forward: true,
      is_outgoing: true,
      payment: 1,
    }),
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, ({end, strictSame, throws}) => {
    if (!!error) {
      throws(() => rpcHtlcAsPayment(args), new Error(error), 'Got err');
    } else {
      strictSame(rpcHtlcAsPayment(args), expected, 'Mapped to payment');
    }

    return end();
  });
});
