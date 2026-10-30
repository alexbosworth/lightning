const {createHash} = require('node:crypto');
const {deepStrictEqual} = require('node:assert').strict;
const {match} = require('node:assert').strict;
const {rejects} = require('node:assert').strict;
const test = require('node:test');

const {createHodlInvoice} = require('./../../../');

const hashOf = hex => createHash('sha256').update(Buffer.from(hex, 'hex'));
const hexHash = /^[0-9a-f]{64}$/;

const request = 'lnbc1pvjluezpp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqypqdpl2pkx2ctnv5sxxmmwwd5kgetjypeh2ursdae8g6twvus8g6rfwvs8qun0dfjkxaq8rkx3yf5tcsyz3d73gafnh3cax9rn449d9p5uxz9ezhhypd0elx87sjle52x86fux2ypatgddc6k63n7erqz25le42c4u4ecky03ylcqca784w';

const makeLnd = ({err, res}) => {
  const response = {payment_request: request};

  return {
    default: {
      newAddress: ({}, cbk) => cbk(null, {address: 'address'}),
    },
    invoices: {
      addHoldInvoice: ({}, cbk) => {
        return cbk(err, res !== undefined ? res : response);
      },
    },
  };
};

const makeArgs = override => {
  const args = {
    cltv_delta: 1,
    description: 'description',
    expires_at: new Date().toISOString(),
    id: Buffer.alloc(32).toString('hex'),
    is_fallback_included: true,
    is_fallback_nested: true,
    is_including_private_channels: true,
    lnd: makeLnd({}),
    mtokens: '1000',
    tokens: 1,
  };

  Object.keys(override).forEach(key => args[key] = override[key]);

  return args;
};

const makeUnexpectedLnd = () => ({
  default: {
    newAddress: () => { throw new Error('UnexpectedNewAddress'); },
  },
  invoices: {
    addHoldInvoice: () => { throw new Error('UnexpectedAddInvoice'); },
  },
});

const tests = [
  {
    args: makeArgs({lnd: undefined}),
    description: 'LND is required to create an invoice',
    error: [400, 'ExpectedInvoicesLndToCreateHodlInvoice'],
  },
  {
    args: makeArgs({
      is_fallback_included: true,
      lnd: makeUnexpectedLnd(),
      mtokens: undefined,
      tokens: 1.5,
    }),
    description: 'Tokens are validated before any address or invoice is made',
    error: [400, 'ExpectedIntegerTokensValueForHodlInvoice'],
  },
  {
    args: makeArgs({routes: 'routes'}),
    description: 'Routes must be an array',
    error: [400, 'ExpectedArrayOfHopHintPathsForRoutes'],
  },
  {
    args: makeArgs({lnd: makeLnd({err: 'err'})}),
    description: 'Errors are passed back',
    error: [503, 'UnexpectedAddHodlInvoiceError', {err: 'err'}],
  },
  {
    args: makeArgs({lnd: makeLnd({res: null})}),
    description: 'A response is expected',
    error: [503, 'ExpectedResponseWhenAddingHodlInvoice'],
  },
  {
    args: makeArgs({lnd: makeLnd({res: {}})}),
    description: 'A payment request is expected',
    error: [503, 'ExpectedPaymentRequestForCreatedInvoice'],
  },
  {
    args: makeArgs({lnd: makeLnd({res: {payment_request: 'request'}})}),
    description: 'A valid payment request is expected',
    error: [503, 'ExpectedValidPaymentRequestForHodlInvoice'],
  },
  {
    args: makeArgs({}),
    description: 'A HODL invoice is created',
    expected: {
      request,
      chain_address: 'address',
      created_at: '2017-06-01T10:57:38.000Z',
      description: 'description',
      id: Buffer.alloc(32).toString('hex'),
      mtokens: '1000',
      tokens: 1,
    },
  },
  {
    args: makeArgs({
      routes: [[
        {public_key: Buffer.alloc(33, 1).toString('hex')},
        {
          base_fee_mtokens: '1',
          channel: '66051x263430x1800',
          cltv_delta: 3,
          fee_rate: 20,
          public_key: Buffer.alloc(33, 2).toString('hex'),
        },
      ]],
    }),
    description: 'A HODL invoice is created with route hints',
    expected: {
      request,
      chain_address: 'address',
      created_at: '2017-06-01T10:57:38.000Z',
      description: 'description',
      id: Buffer.alloc(32).toString('hex'),
      mtokens: '1000',
      tokens: 1,
    },
  },
  {
    args: makeArgs({
      description_hash: Buffer.alloc(32).toString('hex'),
      tokens: undefined,
    }),
    description: 'A HODL invoice is created with a description hash',
    expected: {
      request,
      chain_address: 'address',
      created_at: '2017-06-01T10:57:38.000Z',
      description: 'description',
      id: Buffer.alloc(32).toString('hex'),
      mtokens: '1000',
      tokens: 1,
    },
  },
  {
    args: makeArgs({is_fallback_nested: false}),
    description: 'Fallback is not nested',
    expected: {
      request,
      chain_address: 'address',
      created_at: '2017-06-01T10:57:38.000Z',
      description: 'description',
      id: Buffer.alloc(32).toString('hex'),
      mtokens: '1000',
      tokens: 1,
    },
  },
  {
    args: makeArgs({
      cltv_delta: undefined,
      description: undefined,
      expires_at: undefined,
      id: undefined,
      is_fallback_included: undefined,
      is_fallback_nested: undefined,
      is_including_private_channels: undefined,
      mtokens: undefined,
      tokens: undefined,
    }),
    description: 'A HODL invoice is created with default settings',
    expected: {
      request,
      chain_address: undefined,
      created_at: '2017-06-01T10:57:38.000Z',
      description: undefined,
      mtokens: '0',
      tokens: 0,
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async () => {
    if (!!error) {
      await rejects(() => createHodlInvoice(args), error, 'Got error');

      return;
    }

    const got = await createHodlInvoice(args);

    match(got.id, hexHash, 'Got a payment hash as the invoice id');

    // The id is either the given id or the hash of a random secret
    deepStrictEqual(got, {
      ...expected,
      id: expected.id || hashOf(got.secret).digest('hex'),
      secret: got.secret,
    },
    'Got expected invoice');

    return;
  });
});
