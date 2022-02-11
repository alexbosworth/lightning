const {test} = require('@alexbosworth/tap');

const {getFailedPayments} = require('./../../../');

const makeLnd = args => {
  return {
    default: {
      listPayments: ({}, cbk) => cbk(null, {
        first_index_offset: args.first_index_offset || '1',
        payments: [{
          creation_date: '1',
          creation_time_ns: '1',
          failure_reason: '',
          fee_msat: '1000',
          fee_sat: '1',
          htlcs: [],
          path: [Buffer.alloc(33, 2).toString('hex')],
          payment_hash: Buffer.alloc(32).toString('hex'),
          payment_index: '1',
          payment_preimage: Buffer.alloc(32).toString('hex'),
          payment_request: '',
          status: 'FAILED',
          value: '1',
          value_msat: '1000',
          value_sat: '1',
        }],
        last_index_offset: args.last_index_offset || '1',
      }),
    },
  };
};

const makeArgs = overrides => {
  const args = {lnd: makeLnd({})};

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const makeExpectedPayment = ({}) => {
  return {
    destination: undefined,
    attempts: [],
    confirmed_at: undefined,
    created_at: '1970-01-01T00:00:00.000Z',
    fee: undefined,
    fee_mtokens: undefined,
    hops: [],
    id: '0000000000000000000000000000000000000000000000000000000000000000',
    index: 1,
    is_confirmed: false,
    is_outgoing: true,
    mtokens: '1000',
    request: undefined,
    secret: undefined,
    safe_fee: undefined,
    safe_tokens: 1,
    tokens: 1,
  };
};

const tests = [
  {
    args: makeArgs({limit: 1, token: 'token'}),
    description: 'A limit cannot be passed with a token',
    error: [400, 'ExpectedNoLimitWhenPagingPayFailuresWithToken'],
  },
  {
    args: makeArgs({lnd: undefined}),
    description: 'LND is required',
    error: [400, 'ExpectedLndForGetFailedPaymentsRequest'],
  },
  {
    args: makeArgs({token: 'token'}),
    description: 'A valid token is required',
    error: [400, 'ExpectedValidPagingTokenForGetFailed'],
  },
  {
    args: makeArgs({lnd: {default: {listPayments: ({}, cbk) => cbk('err')}}}),
    description: 'Errors from LND are passed back',
    error: [503, 'UnexpectedGetFailedPaymentsError', {err: 'err'}],
  },
  {
    args: makeArgs({lnd: {default: {listPayments: ({}, cbk) => cbk()}}}),
    description: 'A response is expected from LND',
    error: [503, 'ExpectedFailedPaymentsInListPaymentsResponse'],
  },
  {
    args: makeArgs({
      lnd: {default: {listPayments: ({}, cbk) => cbk(null, {})}},
    }),
    description: 'A response with payments is expected from LND',
    error: [503, 'ExpectedFailedPaymentsInListPaymentsResponse'],
  },
  {
    args: makeArgs({
      lnd: {default: {listPayments: ({}, cbk) => cbk(null, {payments: []})}},
    }),
    description: 'A response with payments and last index is expected',
    error: [503, 'ExpectedLastIndexOffsetWhenRequestingFailed'],
  },
  {
    args: makeArgs({
      lnd: {
        default: {
          listPayments: ({}, cbk) => cbk(null, {
            last_index_offset: '1',
            payments: [{ status: 'FAILED' }],
          }),
        },
      },
    }),
    description: 'A response with valid payments is expected',
    error: [503, 'ExpectedCreationDateInRpcPaymentDetails'],
  },
  {
    args: makeArgs({}),
    description: 'A payment is returned',
    expected: {payment: makeExpectedPayment({})},
  },
  {
    args: makeArgs({
      lnd: {
        default: {
          listPayments: ({}, cbk) => cbk(null, {
            last_index_offset: '1',
            payments: [],
          }),
        },
      },
    }),
    description: 'No payments are returned',
    expected: {},
  },
  {
    args: makeArgs({
      lnd: makeLnd({first_index_offset: '2'}),
      token: JSON.stringify({limit: 1, offset: 1})
    }),
    description: 'A payment is returned when a token is specified',
    expected: {payment: makeExpectedPayment({})},
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, rejects,  strictSame}) => {
    if (!!error) {
      await rejects(() => getFailedPayments(args), error, 'Got expected error');
    } else {
      const {payments} = await getFailedPayments(args);

      const [payment] = payments;

      strictSame(payment, expected.payment, 'Got expected payment');
    }

    return end();
  });
});
