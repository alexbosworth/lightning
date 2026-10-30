const {deepStrictEqual} = require('node:assert').strict;
const {rejects} = require('node:assert').strict;
const test = require('node:test');

const listPayments = require('./../../../lnd_methods/offchain/list_payments');

const makeLnd = args => {
  return {
    default: {
      listPayments: ({}, cbk) => cbk(null, {
        first_index_offset: args.first_index_offset || '1',
        payments: args.payments || [],
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

const tests = [
  {
    args: makeArgs({is_failed: true, is_pending: true}),
    description: 'Both failed and pending cannot be set',
    error: [400, 'EitherFailedOrPendingPaymentsIsSupportedNotBoth'],
  },
  {
    args: makeArgs({token: 'token'}),
    description: 'A valid paging token is required',
    error: [400, 'ExpectedValidPagingTokenForPaymentReq'],
  },
  {
    args: makeArgs({lnd: makeLnd({payments: [{}]})}),
    description: 'Payments that cannot be parsed are an error',
    error: [503, 'ExpectedCreationDateInRpcPaymentDetails'],
  },
  {
    args: makeArgs({}),
    description: 'No payments are returned',
    expected: {next: undefined, payments: []},
  },
  {
    args: makeArgs({
      created_after: new Date().toISOString(),
      created_before: new Date().toISOString(),
      limit: 1,
    }),
    description: 'A date range and limit can be passed',
    expected: {next: undefined, payments: []},
  },
  {
    args: makeArgs({
      lnd: makeLnd({first_index_offset: '2'}),
      token: JSON.stringify({limit: 1, offset: 1}),
    }),
    description: 'Paging continues from a token and returns the next token',
    expected: {next: JSON.stringify({limit: 1, offset: 2}), payments: []},
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async () => {
    if (!!error) {
      await rejects(() => listPayments(args), error, 'Got expected error');
    } else {
      const res = await listPayments(args);

      deepStrictEqual(res, expected, 'Got expected result');
    }

    return;
  });
});
