const {test} = require('@alexbosworth/tap');

const {createInvoice} = require('./../../../');

const request = 'lnbc1pvjluezpp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqypqdpl2pkx2ctnv5sxxmmwwd5kgetjypeh2ursdae8g6twvus8g6rfwvs8qun0dfjkxaq8rkx3yf5tcsyz3d73gafnh3cax9rn449d9p5uxz9ezhhypd0elx87sjle52x86fux2ypatgddc6k63n7erqz25le42c4u4ecky03ylcqca784w';

const makeLnd = ({err, res}) => {
  const response = {
    payment_addr: Buffer.alloc(0),
    payment_request: request,
    r_hash: Buffer.alloc(32),
  };

  return {
    default: {
      addInvoice: ({}, cbk) => cbk(err, res !== undefined ? res : response),
      lookupInvoice: ({}, cbk) => cbk(null, {
        creation_date: '1',
        description_hash: Buffer.alloc(0),
        expiry: '1',
        features: {},
        htlcs: [],
        memo: 'memo',
        payment_addr: Buffer.alloc(0),
        payment_request: request,
        r_hash: Buffer.alloc(32),
        r_preimage: Buffer.alloc(32),
        settled: false,
        value: 1,
      }),
      newAddress: ({}, cbk) => cbk(null, {address: 'address'}),
    },
  };
};

const makeArgs = override => {
  const args = {
    cltv_delta: 1,
    description: 'description',
    description_hash: Buffer.alloc(32).toString('hex'),
    expires_at: new Date(Date.now() + 1e8).toISOString(),
    is_fallback_included: true,
    is_fallback_nested: true,
    is_including_private_channels: true,
    lnd: makeLnd({}),
    secret: Buffer.alloc(32).toString('hex'),
    tokens: 1,
  };

  Object.keys(override).forEach(key => args[key] = override[key]);

  return args;
};

const tests = [
  {
    args: makeArgs({expires_at: new Date().toISOString()}),
    description: 'A future date is expected for expires at',
    error: [400, 'ExpectedFutureDateForInvoiceExpiration'],
  },
  {
    args: makeArgs({secret: 'secret'}),
    description: 'A hex secret is expected',
    error: [400, 'ExpectedHexSecretForNewInvoice'],
  },
  {
    args: makeArgs({lnd: undefined}),
    description: 'LND is required to create invoice',
    error: [400, 'ExpectedLndToCreateNewInvoice'],
  },
  {
    args: makeArgs({mtokens: '1'}),
    description: 'Millitokens and tokens must agree',
    error: [400, 'ExpectedEqualValuesForTokensAndMtokens'],
  },
  {
    args: makeArgs({lnd: makeLnd({err: 'err'})}),
    description: 'LND errors are passed back',
    error: [503, 'AddInvoiceError', {err: 'err'}],
  },
  {
    args: makeArgs({
      lnd: makeLnd({
        err: {details: 'invoice with payment hash already exists'},
      }),
    }),
    description: 'Invoices cannot be created with an existing hash',
    error: [409, 'InvoiceWithGivenHashAlreadyExists'],
  },
  {
    args: makeArgs({lnd: makeLnd({res: {}})}),
    description: 'A payment address is expected in the response',
    error: [503, 'ExpectedPaymentAddressInCreateInvoiceResponse'],
  },
  {
    args: makeArgs({lnd: makeLnd({res: {payment_addr: Buffer.alloc(0)}})}),
    description: 'A payment request is expected in the response',
    error: [503, 'ExpectedPaymentRequestForCreatedInvoice'],
  },
  {
    args: makeArgs({
      lnd: makeLnd({
        res: {payment_addr: Buffer.alloc(0), payment_request: 'request'},
      }),
    }),
    description: 'A valid payment request is expected in the response',
    error: [503, 'ExpectedValidPaymentRequestForInvoice'],
  },
  {
    args: makeArgs({}),
    description: 'An invoice is created',
    expected: {
      request,
      chain_address: 'address',
      created_at: '1970-01-01T00:00:01.000Z',
      description: 'description',
      id: '0001020304050607080900010203040506070809000102030405060708090102',
      mtokens: '0',
      payment: undefined,
      secret: Buffer.alloc(32).toString('hex'),
      tokens: 0,
    },
  },
  {
    args: makeArgs({
      cltv_delta: undefined,
      expires_at: undefined,
      secret: undefined,
      is_fallback_included: false,
      tokens: undefined,
    }),
    description: 'An invoice is created with no on-chain fallback',
    expected: {
      request,
      chain_address: undefined,
      created_at: '1970-01-01T00:00:01.000Z',
      description: 'description',
      id: '0001020304050607080900010203040506070809000102030405060708090102',
      mtokens: '0',
      payment: undefined,
      secret: Buffer.alloc(32).toString('hex'),
      tokens: 0,
    },
  },
  {
    args: makeArgs({
      description_hash: undefined,
      description: undefined,
      secret: undefined,
      is_fallback_nested: false,
    }),
    description: 'An invoice is created without a nested on-chain address',
    expected: {
      request,
      chain_address: 'address',
      created_at: '1970-01-01T00:00:01.000Z',
      description: undefined,
      id: '0001020304050607080900010203040506070809000102030405060708090102',
      mtokens: '0',
      payment: undefined,
      secret: Buffer.alloc(32).toString('hex'),
      tokens: 0,
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, rejects, strictSame}) => {
    if (!!error) {
      await rejects(() => createInvoice(args), error, 'Got error');
    } else {
      strictSame(await createInvoice(args), expected, 'Got expected result');
    }

    return end();
  });
});
