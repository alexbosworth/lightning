const {test} = require('@alexbosworth/tap');

const {confirmedFromPayment} = require('./../../lnd_responses');

const makeArgs = overrides => {
  const args = {
    creation_date: '1',
    creation_time_ns: '1',
    failure_reason: 'FAILURE_REASON_NONE',
    fee: '1',
    fee_msat: '1000',
    fee_sat: '1',
    htlcs: [{
      attempt_time_ns: '1',
      status: 'SUCCEEDED',
      resolve_time_ns: '1',
      route: {
        hops: [{
          amt_to_forward: '1',
          amt_to_forward_msat: '1000',
          chan_capacity: '1',
          chan_id: '1',
          custom_records: {'1': Buffer.alloc(1)},
          expiry: 1,
          fee: '1',
          fee_msat: '1000',
          mpp_record: {payment_addr: Buffer.alloc(32), total_amt_msat: '1000'},
          pub_key: Buffer.alloc(33).toString('hex'),
          tlv_payload: true,
        }],
        total_amt: '1',
        total_amt_msat: '1000',
        total_time_lock: 1,
        total_fees: '1',
        total_fees_msat: '1000',
      },
    }],
    path: [Buffer.alloc(33).toString('hex')],
    payment_hash: Buffer.alloc(32).toString('hex'),
    payment_index: '1',
    payment_preimage: Buffer.alloc(32).toString('hex'),
    payment_request: '',
    status: 'SUCCEEDED',
    value: '1',
    value_msat: '1000',
    value_sat: '1',
  };

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const makeExpected = overrides => {
  const expected = {
    confirmed_at: '1970-01-01T00:00:00.000Z',
    created_at: '1970-01-01T00:00:00.000Z',
    destination: Buffer.alloc(33).toString('hex'),
    fee: 1,
    fee_mtokens: '1000',
    hops: [{
      channel: '0x0x1',
      channel_capacity: 1,
      fee: 1,
      fee_mtokens: '1000',
      forward: 1,
      forward_mtokens: '1000',
      public_key: Buffer.alloc(33).toString('hex'),
      timeout: 1,
    }],
    id: Buffer.alloc(32).toString('hex'),
    mtokens: '2000',
    paths: [{
      fee: 1,
      fee_mtokens: '1000',
      hops: [{
        channel: '0x0x1',
        channel_capacity: 1,
        fee: 1,
        fee_mtokens: '1000',
        forward: 1,
        forward_mtokens: '1000',
        public_key: Buffer.alloc(33).toString('hex'),
        timeout: 1,
      }],
      mtokens: '1000',
      payment: '0000000000000000000000000000000000000000000000000000000000000000',
      timeout: 1,
      tokens: 1,
      total_mtokens: '1000',
    }],
    request: undefined,
    safe_fee: 1,
    safe_tokens: 2,
    secret: Buffer.alloc(32).toString('hex'),
    timeout: 1,
    tokens: 2,
  };

  Object.keys(overrides).forEach(k => expected[k] = overrides[k]);

  return expected;
};

const tests = [
  {
    args: undefined,
    description: 'A payment is expected',
    error: 'ExpectedConfirmedPaymentToDeriveConfirmationDetails',
  },
  {
    args: makeArgs({fee_msat: undefined}),
    description: 'Fee millitokens are expected',
    error: 'ExpectedPaymentFeeMillitokensAmountForPayment',
  },
  {
    args: makeArgs({htlcs: undefined}),
    description: 'HTLCs are expected',
    error: 'ExpectedArrayOfPaymentHtlcsInConfirmedPayment',
  },
  {
    args: makeArgs({htlcs: [{}]}),
    description: 'A successful HTLC is expected',
    error: 'ExpectedSuccessHtlcInConfirmedPayment',
  },
  {
    args: makeArgs({payment_hash: undefined}),
    description: 'A payment hash is expected',
    error: 'ExpectedPaymentHashForPaymentAsConfirmedPayment',
  },
  {
    args: makeArgs({payment_preimage: undefined}),
    description: 'A payment preimage is expected',
    error: 'ExpectedPaymentPreimageForPaymentAsConfirmedPayment',
  },
  {
    args: makeArgs({value_sat: '1', value_msat: '0'}),
    description: 'Values are expected to agree',
    error: 'ExpectedValueOfTokensAndMillitokensToBeConsistent',
  },
  {
    args: makeArgs({}),
    description: 'Payment is mapped to confirmed payment details',
    expected: makeExpected({}),
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, ({end, strictSame, throws}) => {
    if (!!error) {
      throws(() => confirmedFromPayment(args), new Error(error), 'Err');
    } else {
      strictSame(confirmedFromPayment(args), expected, 'Mapped');
    }

    return end();
  });
});
