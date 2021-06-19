const {test} = require('@alexbosworth/tap');

const {deleteFailedPayments} = require('./../../../lnd_methods');

const tests = [
  {
    args: {},
    description: 'LND object is required',
    error: [400, 'ExpectedAuthenticatedLndToDeleteFailedPayments'],
  },
  {
    args: {lnd: {default: {deleteAllPayments: ({}, cbk) => cbk('err')}}},
    description: 'An unexpected error is returned',
    error: [503, 'UnexpectedErrorDeletingFailedPayments', {err: 'err'}],
  },
  {
    args: {lnd: {default: {deleteAllPayments: ({}, cbk) => cbk()}}},
    description: 'Failed payments are deleted',
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({deepEqual, end, equal, rejects}) => {
    if (!!error) {
      await rejects(deleteFailedPayments(args), error, 'Got expected err');
    } else {
      await deleteFailedPayments(args);
    }

    return end();
  });
});
