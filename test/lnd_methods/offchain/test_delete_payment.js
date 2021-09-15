const {test} = require('@alexbosworth/tap');

const {deletePayment} = require('./../../../lnd_methods');

const tests = [
  {
    args: {},
    description: 'An id is required',
    error: [400, 'ExpectedPaymentHashToDeletePaymentRecord'],
  },
  {
    args: {id: Buffer.alloc(32).toString('hex')},
    description: 'LND object is required',
    error: [400, 'ExpectedAuthenticatedLndToDeletePayment'],
  },
  {
    args: {
      id: Buffer.alloc(32).toString('hex'),
      lnd: {default: {deletePayment: ({}, cbk) => cbk({details: 'unknown'})}},
    },
    description: 'An unexpected error is returned',
    error: [501, 'DeletePaymentMethodNotSupported'],
  },
  {
    args: {
      id: Buffer.alloc(32).toString('hex'),
      lnd: {default: {deletePayment: ({}, cbk) => cbk('err')}},
    },
    description: 'An unexpected error is returned',
    error: [503, 'UnexpectedErrorDeletingPayment', {err: 'err'}],
  },
  {
    args: {
      id: Buffer.alloc(32).toString('hex'),
      lnd: {default: {deletePayment: ({}, cbk) => cbk()}},
    },
    description: 'Payments are deleted',
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({deepEqual, end, equal, rejects}) => {
    if (!!error) {
      await rejects(deletePayment(args), error, 'Got expected error');
    } else {
      await deletePayment(args);
    }

    return end();
  });
});
