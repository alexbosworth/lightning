const {test} = require('@alexbosworth/tap');

const listPayments = require('./../../../lnd_methods/offchain/list_payments');

const makeLnd = args => {
  return {
    default: {
      listPayments: ({}, cbk) => cbk(null, {
        first_index_offset: args.first_index_offset || '1',
        payments: [],
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
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, rejects, strictSame}) => {
    if (!!error) {
      await rejects(() => listPayments(args), error, 'Got expected error');
    } else {
      const res = await listPayments(args);

      strictSame(res, expected, 'Got expected result');
    }

    return end();
  });
});
