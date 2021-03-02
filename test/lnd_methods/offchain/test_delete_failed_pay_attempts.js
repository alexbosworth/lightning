const {test} = require('tap');

const {deleteFailedPayAttempts} = require('./../../../lnd_methods');

const tests = [
  {
    args: {},
    description: 'LND object is required',
    error: [400, 'ExpectedAuthenticatedLndToDeleteFailedAttempts'],
  },
  {
    args: {lnd: {default: {deleteAllPayments: ({}, cbk) => cbk('err')}}},
    description: 'An unexpected error is returned',
    error: [503, 'UnexpectedErrorDeletingFailedAttempts', {err: 'err'}],
  },
  {
    args: {lnd: {default: {deleteAllPayments: ({}, cbk) => cbk()}}},
    description: 'Payment attempts are deleted',
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({deepEqual, end, equal, rejects}) => {
    if (!!error) {
      await rejects(deleteFailedPayAttempts(args), error, 'Got expected err');
    } else {
      await deleteFailedPayAttempts(args);
    }

    return end();
  });
});
