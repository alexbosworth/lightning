const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

const {failureFromPayment} = require('./../../lnd_responses');

const id = Buffer.alloc(32).toString('hex')

const makeExpected = overrides => {
  const expected = {
    id,
    is_canceled: false,
    is_insufficient_balance: false,
    is_invalid_payment: false,
    is_pathfinding_timeout: false,
    is_route_not_found: false,
  };

  Object.keys(overrides).forEach(k => expected[k] = overrides[k]);

  return expected;
};

const tests = [
  {
    args: {
      failure_reason: 'FAILURE_REASON_INSUFFICIENT_BALANCE',
      payment_hash: id,
    },
    description: 'Insufficient balance mapped',
    expected: makeExpected({is_insufficient_balance: true}),
  },
  {
    args: {
      failure_reason: 'FAILURE_REASON_INCORRECT_PAYMENT_DETAILS',
      payment_hash: id,
    },
    description: 'Invalid payment is mapped',
    expected: makeExpected({is_invalid_payment: true}),
  },
  {
    args: {
      failure_reason: 'FAILURE_REASON_NO_ROUTE',
      payment_hash: id,
    },
    description: 'No route is mapped',
    expected: makeExpected({is_route_not_found: true}),
  },
  {
    args: {
      failure_reason: 'FAILURE_REASON_TIMEOUT',
      payment_hash: id,
    },
    description: 'Timeout is mapped',
    expected: makeExpected({is_pathfinding_timeout: true}),
  },
  {
    args: {
      failure_reason: 'FAILURE_REASON_CANCELED',
      payment_hash: id,
    },
    description: 'Cancel is mapped',
    expected: makeExpected({is_canceled: true}),
  },
  {
    args: {payment_hash: undefined},
    description: 'A payment hash is expected',
    error: 'ExpectedPaymentHashForPaymentAsFailedPayment',
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, (t, end) => {
    if (!!error) {
      throws(() => failureFromPayment(args), new Error(error), 'Got error');
    } else {
      deepStrictEqual(failureFromPayment(args), expected, 'Got expected');
    }

    return end();
  })
});
