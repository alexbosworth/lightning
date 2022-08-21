const {test} = require('@alexbosworth/tap');

const {rpcInvoiceAsInvoice} = require('./../../lnd_responses');

const makeInput = overrides => {
  const response = {
    add_index: '1',
    amt_paid_msat: '1000',
    amt_paid_sat: 1,
    cltv_expiry: '1',
    creation_date: '1',
    description_hash: Buffer.alloc(32),
    expiry: '1',
    fallback_addr: 'address',
    features: {
      '1': {
        is_known: true,
        is_required: false,
        name: 'name',
      },
    },
    htlcs: [{
      accept_height: 1,
      accept_time: '1',
      amt_msat: '1',
      chan_id: '1',
      custom_records: {'1': Buffer.alloc(32)},
      expiry_height: 1,
      htlc_index: '1',
      mpp_total_amt_msat: '1',
      resolve_time: '1',
      state: 'STATE',
    }],
    is_keysend: true,
    memo: 'memo',
    payment_addr: Buffer.alloc(0),
    payment_request: 'request',
    private: true,
    r_hash: Buffer.alloc(32),
    r_preimage: Buffer.alloc(32),
    route_hints: [{
      hop_hints: [{
        chan_id: '1',
        cltv_expiry_delta: 1,
        fee_base_msat: 1,
        fee_proportional_millionths: 1,
        node_id: Buffer.alloc(33).toString('hex'),
      }],
    }],
    settle_date: '1',
    settle_index: '1',
    state: 'STATE',
    value: '1',
    value_msat: '1000',
  };

  Object.keys(overrides || {}).forEach(key => response[key] = overrides[key]);

  return response;
};


const makeExpected = overrides => {
  const expected = {
    chain_address: 'address',
    cltv_delta: 1,
    confirmed_at: undefined,
    confirmed_index: 1,
    created_at: '1970-01-01T00:00:01.000Z',
    description: 'memo',
    description_hash: Buffer.alloc(32).toString('hex'),
    expires_at: '1970-01-01T00:00:02.000Z',
    features: [{
      bit: 1,
      is_known: true,
      is_required: false,
      type: 'data_loss_protection',
    }],
    id: Buffer.alloc(32).toString('hex'),
    index: 1,
    is_canceled: undefined,
    is_confirmed: false,
    is_held: undefined,
    is_private: true,
    is_push: true,
    mtokens: '1000',
    payment: undefined,
    payments: [{
      canceled_at: undefined,
      confirmed_at: undefined,
      created_at: '1970-01-01T00:00:01.000Z',
      created_height: 1,
      in_channel: '0x0x1',
      is_canceled: false,
      is_confirmed: false,
      is_held: false,
      messages: [{type: '49', value: Buffer.alloc(32).toString('hex')}],
      mtokens: '1',
      pending_index: undefined,
      timeout: 1,
      tokens: 0,
      total_mtokens: '1',
    }],
    received: 1,
    received_mtokens: '1000',
    request: 'request',
    secret: '0000000000000000000000000000000000000000000000000000000000000000',
    tokens: 1,
  };

  Object.keys(overrides || {}).forEach(key => expected[key] = overrides[key]);

  return expected;
};

const tests = [
  {
    description: 'RPC invoice is expected',
    error: 'ExpectedResponseWhenLookingUpInvoice',
  },
  {
    args: makeInput({creation_date: undefined}),
    description: 'The creation date is expected',
    error: 'ExpectedInvoiceCreationDateInResponse',
  },
  {
    args: makeInput({description_hash: undefined}),
    description: 'The description hash is expected',
    error: 'ExpectedDescriptionHashInGetInvoiceResposne',
  },
  {
    args: makeInput({expiry: undefined}),
    description: 'The expiry is expected',
    error: 'ExpectedExpirySecondsInGetInvoiceResponse',
  },
  {
    args: makeInput({features: undefined}),
    description: 'The invoice features are expected',
    error: 'ExpectedFeaturesInLookupInvoiceResponse',
  },
  {
    args: makeInput({htlcs: undefined}),
    description: 'Invoice htlcs are expected',
    error: 'ExpectedArrayOfResponseHtlcs',
  },
  {
    args: makeInput({htlcs: [{}]}),
    description: 'Valid invoice htlcs are expected',
    error: 'ExpectedAcceptHeightInResponseHtlc',
  },
  {
    args: makeInput({is_keysend: undefined, payment_request: undefined}),
    description: 'Keysend state is expected',
    error: 'ExpectedPaymentRequestForInvoice',
  },
  {
    args: makeInput({memo: undefined}),
    description: 'RPC invoice is expected to have a memo',
    error: 'ExpectedMemoInLookupInvoiceResponse',
  },
  {
    args: makeInput({payment_addr: undefined}),
    description: 'RPC invoice is expected to have a payment identifier',
    error: 'ExpectedPaymentAddressBufferInRpcInvoiceMessage',
  },
  {
    args: makeInput({r_hash: undefined}),
    description: 'Payment hash is expected',
    error: 'ExpectedPreimageHashInLookupInvoiceResponse',
  },
  {
    args: makeInput({r_hash: undefined}),
    description: 'Payment hash is expected',
    error: 'ExpectedPreimageHashInLookupInvoiceResponse',
  },
  {
    args: makeInput({r_preimage: undefined}),
    description: 'Preimage is expected',
    error: 'ExpectedPreimageInLookupInvoiceResponse',
  },
  {
    args: makeInput({value: undefined}),
    description: 'Value is expected',
    error: 'ExpectedTokensValueInLookupInvoiceResponse',
  },
  {
    args: makeInput({}),
    description: 'RPC invoice is mapped to invoice',
    expected: makeExpected({}),
  },
  {
    args: makeInput({
      is_amp: true,
      is_keysend: false,
      payment_request: undefined,
      state: 'SETTLED',
    }),
    description: 'AMP invoice mapped to invoice',
    expected: makeExpected({
      confirmed_at: '1970-01-01T00:00:01.000Z',
      is_confirmed: true,
      request: undefined,
    }),
  },
  {
    args: makeInput({
      payment_request: undefined,
      state: 'SETTLED',
      value_msat: '0',
    }),
    description: 'Unsettled zero RPC invoice mapped to invoice',
    expected: makeExpected({
      confirmed_at: '1970-01-01T00:00:01.000Z',
      is_confirmed: true,
      request: undefined,
    }),
  },
  {
    args: makeInput({payment_addr: Buffer.alloc(32)}),
    description: 'Empty payment address is not returned as a pay addr',
    expected: makeExpected({}),
  },
  {
    args: makeInput({is_keysend: false}),
    description: 'Non keysend is not push',
    expected: makeExpected({is_push: undefined}),
  },
  {
    args: makeInput({payment_addr: Buffer.alloc(32, 1)}),
    description: 'Pay addr is returned as a payment id',
    expected: makeExpected({
      payment: '0101010101010101010101010101010101010101010101010101010101010101',
    }),
  },
  {
    args: makeInput({
      fallback_addr: '',
      description_hash: Buffer.alloc(0),
      is_amp: true,
      is_keysend: false,
      payment_request: '',
      settle_index: '0',
    }),
    description: 'Values are undefined',
    expected: makeExpected({
      chain_address: undefined,
      confirmed_index: undefined,
      description_hash: undefined,
      request: undefined,
    }),
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, ({end, strictSame, throws}) => {
    if (!!error) {
      throws(() => rpcInvoiceAsInvoice(args), new Error(error), 'Got err');
    } else {
      strictSame(rpcInvoiceAsInvoice(args), expected, 'Mapped to invoice');
    }

    return end();
  });
});
