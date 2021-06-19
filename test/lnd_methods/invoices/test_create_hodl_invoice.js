const {test} = require('@alexbosworth/tap');

const {createHodlInvoice} = require('./../../../');

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

const tests = [
  {
    args: makeArgs({lnd: undefined}),
    description: 'LND is required to create an invoice',
    error: [400, 'ExpectedInvoicesLndToCreateHodlInvoice'],
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
  return test(description, async ({end, equal, rejects, strictSame}) => {
    if (!!error) {
      await rejects(() => createHodlInvoice(args), error, 'Got error');
    } else {
      const got = await createHodlInvoice(args);

      if (!!expected.id) {
        equal(got.id, expected.id, 'Got expected id');
      }

      equal(got.id.length, 64, 'Got id');

      if (!!got.secret) {
        equal(got.secret.length, 64, 'Got secret');
      }

      delete expected.id;
      delete got.id;
      delete got.secret;

      strictSame(got, expected, 'Got expected result');
    }

    return end();
  });
});
