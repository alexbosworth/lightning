const {test} = require('@alexbosworth/tap');

const {paymentRequestDetails} = require('./../../lnd_responses');

const makeDetails = overrides => {
  const details = {
    description: 'description',
    description_hash: '',
    destination: Buffer.alloc(33, 3).toString('hex'),
    cltv_expiry: '1',
    expiry: '1',
    features: {
      '1': {
        is_known: true,
        is_required: false,
        name: 'feature',
      },
    },
    fallback_addr: 'address',
    num_msat: '1000',
    num_satoshis: 1,
    payment_addr: Buffer.alloc(32),
    payment_hash: Buffer.alloc(32).toString('hex'),
    route_hints: [{
      hop_hints: [{
        chan_id: '1',
        cltv_expiry_delta: 1,
        fee_base_msat: '1000',
        fee_proportional_millionths: 1,
        node_id: Buffer.alloc(33, 3).toString('hex'),
      }],
    }],
    timestamp: '1',
  };

  Object.keys(overrides).forEach(k => details[k] = overrides[k]);

  return details;
};

const tests = [
  {
    args: makeDetails({destination: undefined}),
    description: 'Destination is needed',
    error: 'ExpectedDestinationInDecodedPaymentRequest',
  },
  {
    args: makeDetails({expiry: undefined}),
    description: 'Expiry is needed',
    error: 'ExpectedPaymentReqExpirationInDecodedPayReq',
  },
  {
    args: makeDetails({payment_addr: undefined}),
    description: 'Payment address is needed',
    error: 'ExpectedPaymentAddrBufferInDecodePayReqResponse',
  },
  {
    args: makeDetails({payment_hash: undefined}),
    description: 'Payment hash is needed',
    error: 'ExpectedPaymentHashFromDecodePayReqResponse',
  },
  {
    args: makeDetails({num_satoshis: undefined}),
    description: 'Number of satoshis is needed',
    error: 'ExpectedNumSatoshis',
  },
  {
    args: makeDetails({route_hints: undefined}),
    description: 'Route hints is expected',
    error: 'ExpectedRouteHintsArray',
  },
  {
    args: makeDetails({timestamp: undefined}),
    description: 'A timestamp is expected',
    error: 'ExpectedPaymentRequestTimestamp',
  },
  {
    args: makeDetails({}),
    description: 'Payment details mapped',
    expected: {
      chain_address: 'address',
      cltv_delta: 1,
      created_at: '1970-01-01T00:00:01.000Z',
      description: 'description',
      description_hash: undefined,
      destination: Buffer.alloc(33, 3).toString('hex'),
      expires_at: '1970-01-01T00:00:02.000Z',
      features: [{
        bit: 1,
        is_known: true,
        is_required: false,
        type: 'data_loss_protection',
      }],
      id: Buffer.alloc(32).toString('hex'),
      is_expired: true,
      mtokens: '1000',
      payment: Buffer.alloc(32).toString('hex'),
      routes: [[
        {
          public_key: Buffer.alloc(33, 3).toString('hex'),
        },
        {
          base_fee_mtokens: '1000',
          channel: '0x0x1',
          cltv_delta: 1,
          fee_rate: 1,
          public_key: Buffer.alloc(33, 3).toString('hex'),
        },
      ]],
      safe_tokens: 1,
      tokens: 1,
    },
  },
  {
    args: makeDetails({
      expiry: '0',
      fallback_addr: '',
      cltv_expiry: '0',
      payment_addr: Buffer.alloc(0),
    }),
    description: 'Payment mapped to details with missing details',
    expected: {
      chain_address: undefined,
      cltv_delta: undefined,
      created_at: '1970-01-01T00:00:01.000Z',
      description: 'description',
      description_hash: undefined,
      destination: Buffer.alloc(33, 3).toString('hex'),
      expires_at: '1970-01-01T01:00:01.000Z',
      features: [{
        bit: 1,
        is_known: true,
        is_required: false,
        type: 'data_loss_protection',
      }],
      id: Buffer.alloc(32).toString('hex'),
      is_expired: true,
      mtokens: '1000',
      payment: undefined,
      routes: [[
        {
          public_key: Buffer.alloc(33, 3).toString('hex'),
        },
        {
          base_fee_mtokens: '1000',
          channel: '0x0x1',
          cltv_delta: 1,
          fee_rate: 1,
          public_key: Buffer.alloc(33, 3).toString('hex'),
        },
      ]],
      safe_tokens: 1,
      tokens: 1,
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, ({end, strictSame, throws}) => {
    if (!!error) {
      throws(() => paymentRequestDetails(args), new Error(error), 'Got err');
    } else {
      strictSame(paymentRequestDetails(args), expected, 'Mapped as payment');
    }

    return end();
  });
});
