const {test} = require('tap');

const {stateAsFailure} = require('./../../lnd_responses');

const makeExpected = overrides => {
  const expected = {
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
    args: {state: 'FAILED_INSUFFICIENT_BALANCE'},
    description: 'Insufficient balance mapped',
    expected: makeExpected({is_insufficient_balance: true}),
  },
  {
    args: {state: 'FAILED_INCORRECT_PAYMENT_DETAILS'},
    description: 'Invalid payment is mapped',
    expected: makeExpected({is_invalid_payment: true}),
  },
  {
    args: {state: 'FAILED_NO_ROUTE'},
    description: 'No route is mapped',
    expected: makeExpected({is_route_not_found: true}),
  },
  {
    args: {state: 'FAILED_TIMEOUT'},
    description: 'Timeout is mapped',
    expected: makeExpected({is_pathfinding_timeout: true}),
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(({deepIs, end, equal, throws}) => {
    if (!!error) {
      throws(() => stateAsFailure(args), new Error(error), 'Got error');
    } else {
      deepIs(stateAsFailure(args), expected, 'Got expected');
    }

    return end();
  })
});
