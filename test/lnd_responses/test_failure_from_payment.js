const {test} = require('@alexbosworth/tap');

const {failureFromPayment} = require('./../../lnd_responses');

const payment_hash = Buffer.alloc(32).toString('hex')

const makeExpected = overrides => {
  const expected = {
    id: payment_hash,
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
    args: {payment_hash, failure_reason: 'FAILURE_REASON_INSUFFICIENT_BALANCE'},
    description: 'Insufficient balance mapped',
    expected: makeExpected({is_insufficient_balance: true}),
  },
  {
    args: {payment_hash, failure_reason: 'FAILURE_REASON_INCORRECT_PAYMENT_DETAILS'},
    description: 'Invalid payment is mapped',
    expected: makeExpected({is_invalid_payment: true}),
  },
  {
    args: {payment_hash, failure_reason: 'FAILURE_REASON_NO_ROUTE'},
    description: 'No route is mapped',
    expected: makeExpected({is_route_not_found: true}),
  },
  {
    args: {payment_hash, failure_reason: 'FAILURE_REASON_TIMEOUT'},
    description: 'Timeout is mapped',
    expected: makeExpected({is_pathfinding_timeout: true}),
  },
  {
    args: {payment_hash: undefined},
    description: 'A payment hash is expected',
    error: 'ExpectedPaymentHashForPaymentAsFailedPayment',
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(({end, equal, strictSame, throws}) => {
    if (!!error) {
      throws(() => failureFromPayment(args), new Error(error), 'Got error');
    } else {
      strictSame(failureFromPayment(args), expected, 'Got expected');
    }

    return end();
  })
});
