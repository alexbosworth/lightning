const {test} = require('@alexbosworth/tap');

const {getPayments} = require('./../../../');

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
          htlcs: [{
            attempt_time_ns: '1',
            resolve_time_ns: '1',
            route: {
              hops: [{
                amt_to_forward: '1',
                amt_to_forward_msat: '1000',
                chan_id: '1',
                chan_capacity: 1,
                expiry: 1,
                fee: 1,
                fee_msat: '1000',
                pub_key: Buffer.alloc(33, 2).toString('hex'),
                tlv_payload: false,
              }],
              total_amt: '1',
              total_amt_msat: '1000',
              total_fees: '1',
              total_fees_msat: '1000',
              total_time_lock: 1,
            },
            status: 'SUCCEEDED',
          }],
          path: [Buffer.alloc(33, 2).toString('hex')],
          payment_hash: Buffer.alloc(32).toString('hex'),
          payment_index: '1',
          payment_preimage: Buffer.alloc(32, 1).toString('hex'),
          payment_request: '',
          status: 'SETTLED',
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
    destination: '020202020202020202020202020202020202020202020202020202020202020202',
    attempts: [{
      confirmed_at: '1970-01-01T00:00:00.000Z',
      created_at: '1970-01-01T00:00:00.000Z',
      failed_at: undefined,
      is_confirmed: true,
      is_failed: false,
      is_pending: false,
      route: {
        fee: 1,
        fee_mtokens: '1000',
        hops: [{
          channel: '0x0x1',
          channel_capacity: 1,
          fee: 1,
          fee_mtokens: '1000',
          forward: 1,
          forward_mtokens: '1000',
          public_key: Buffer.alloc(33, 2).toString('hex'),
          timeout: 1,
        }],
        mtokens: '1000',
        payment: undefined,
        timeout: 1,
        tokens: 1,
        total_mtokens: undefined
      },
    }],
    confirmed_at: '1970-01-01T00:00:00.000Z',
    created_at: '1970-01-01T00:00:00.000Z',
    fee: 1,
    fee_mtokens: '1000',
    hops: [],
    id: '0000000000000000000000000000000000000000000000000000000000000000',
    index: 1,
    is_confirmed: true,
    is_outgoing: true,
    mtokens: '1000',
    request: undefined,
    secret: Buffer.alloc(32, 1).toString('hex'),
    safe_fee: 1,
    safe_tokens: 1,
    tokens: 1,
  };
};

const tests = [
  {
    args: makeArgs({limit: 1, token: 'token'}),
    description: 'A limit cannot be passed with a token',
    error: [400, 'UnexpectedLimitWhenPagingPaymentsWithToken'],
  },
  {
    args: makeArgs({lnd: undefined}),
    description: 'LND is required',
    error: [400, 'ExpectedLndForGetPaymentsRequest'],
  },
  {
    args: makeArgs({token: 'token'}),
    description: 'A valid token is required',
    error: [400, 'ExpectedValidPagingTokenForPaymentReq'],
  },
  {
    args: makeArgs({lnd: {default: {listPayments: ({}, cbk) => cbk('err')}}}),
    description: 'Errors from LND are passed back',
    error: [503, 'UnexpectedGetPaymentsError', {err: 'err'}],
  },
  {
    args: makeArgs({lnd: {default: {listPayments: ({}, cbk) => cbk()}}}),
    description: 'A response is expected from LND',
    error: [503, 'ExpectedPaymentsInListPaymentsResponse'],
  },
  {
    args: makeArgs({
      lnd: {default: {listPayments: ({}, cbk) => cbk(null, {})}},
    }),
    description: 'A response with payments is expected from LND',
    error: [503, 'ExpectedPaymentsInListPaymentsResponse'],
  },
  {
    args: makeArgs({
      lnd: {default: {listPayments: ({}, cbk) => cbk(null, {payments: []})}},
    }),
    description: 'A response with payments and last index is expected',
    error: [503, 'ExpectedLastIndexOffsetWhenRequestingPayments'],
  },
  {
    args: makeArgs({
      lnd: {
        default: {
          listPayments: ({}, cbk) => cbk(null, {
            last_index_offset: '1',
            payments: [{}],
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
      await rejects(() => getPayments(args), error, 'Got expected error');
    } else {
      const {payments} = await getPayments(args);

      const [payment] = payments;

      strictSame(payment, expected.payment, 'Got expected payment');
    }

    return end();
  });
});
