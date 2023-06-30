const {rejects} = require('node:assert').strict;
const test = require('node:test');

const {deleteFailedPayAttempts} = require('./../../../lnd_methods');

const tests = [
  {
    args: {},
    description: 'LND object is required',
    error: [400, 'ExpectedAuthenticatedLndToDeleteFailedAttempts'],
  },
  {
    args: {id: 1},
    description: 'A payment id is expected to be a hash',
    error: [400, 'ExpectedPaymentHashToDeleteFailedPayAttempts'],
  },
  {
    args: {
      id: Buffer.alloc(32).toString('hex'),
      lnd: {
        default: {
          deleteAllPayments: ({}, cbk) => cbk(),
          deletePayment: ({}, cbk) => cbk({details: 'unknown'}),
        },
      },
    },
    description: 'An unsupported error is returned',
    error: [501, 'DeleteFailedPaymentAttemptsMethodNotSupported'],
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
  return test(description, async () => {
    if (!!error) {
      await rejects(deleteFailedPayAttempts(args), error, 'Got expected err');
    } else {
      await deleteFailedPayAttempts(args);
    }

    return;
  });
});
