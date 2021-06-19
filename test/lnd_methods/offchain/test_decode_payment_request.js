const {test} = require('@alexbosworth/tap');

const {decodePaymentRequest} = require('./../../../');

const tests = [
  {
    args: {},
    description: 'LND object is required',
    error: [400, 'ExpectedLndForDecodingPaymentRequest'],
  },
  {
    args: {lnd: {default: {decodePayReq: ({}, cbk) => cbk('err')}}},
    description: 'Request is required',
    error: [400, 'ExpectedPaymentRequestToDecode'],
  },
  {
    args: {
      lnd: {default: {decodePayReq: ({}, cbk) => cbk('err')}},
      request: 'request',
    },
    description: 'An unexpected error is returned',
    error: [503, 'UnexpectedDecodePaymentRequestError', {err: 'err'}],
  },
  {
    args: {
      lnd: {default: {decodePayReq: ({}, cbk) => cbk()}},
      request: 'request',
    },
    description: 'An unexpected error is returned',
    error: [503, 'ExpectedResponseFromDecodePaymentRequest'],
  },
  {
    args: {
      lnd: {default: {decodePayReq: ({}, cbk) => cbk(null, {})}},
      request: 'request',
    },
    description: 'An unexpected error is returned',
    error: [503, 'ExpectedDestinationInDecodedPaymentRequest'],
  },
  {
    args: {
      lnd: {
        default: {
          decodePayReq: ({}, cbk) => cbk(null, {
            destination: Buffer.alloc(33, 3).toString('hex'),
            cltv_expiry: '1',
            expiry: '1',
            features: {},
            num_msat: '1000',
            num_satoshis: 1,
            payment_addr: Buffer.alloc(0),
            payment_hash: Buffer.alloc(32).toString('hex'),
            route_hints: [],
            timestamp: '1',
          }),
        },
      },
      request: 'request',
    },
    description: 'Payment request is decoded',
    expected: {
      chain_address: undefined,
      cltv_delta: 1,
      created_at: '1970-01-01T00:00:01.000Z',
      description: undefined,
      description_hash: undefined,
      destination: Buffer.alloc(33, 3).toString('hex'),
      expires_at: '1970-01-01T00:00:02.000Z',
      features: [],
      id: Buffer.alloc(32).toString('hex'),
      is_expired: true,
      mtokens: '1000',
      payment: undefined,
      routes: [],
      safe_tokens: 1,
      tokens: 1,
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, equal, rejects, strictSame}) => {
    if (!!error) {
      await rejects(decodePaymentRequest(args), error, 'Got expected error');
    } else {
      const details = await decodePaymentRequest(args);

      strictSame(details, expected, 'Got expected details');
    }

    return end();
  });
});
