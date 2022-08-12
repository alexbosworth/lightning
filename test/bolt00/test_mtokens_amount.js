const {test} = require('@alexbosworth/tap');

const {mtokensAmount} = require('./../../bolt00');

const tests = [
  {
    args: {},
    description: 'Default mtokens is undefined',
    expected: {},
  },
  {
    args: {tokens: 0},
    description: 'Tokens can be zero',
    expected: {mtokens: '0'},
  },
  {
    args: {tokens: 1},
    description: 'Tokens are converted to mtokens',
    expected: {mtokens: '1000'},
  },
  {
    args: {tokens: 'invalid number'},
    description: 'Tokens must be a valid number',
    error: 'ExpectedEitherTokensNumberOrMtokensStringForAmountValue',
  },
  {
    args: {mtokens: '1000'},
    description: 'Mtokens are returned',
    expected: {mtokens: '1000'},
  },
  {
    args: {mtokens: '1000', tokens: 2},
    description: 'Mtokens and tokens must agree',
    error: 'ExpectedEqualValuesForTokensAndMtokens',
  },
  {
    args: {mtokens: '1000', tokens: 1},
    description: 'Mtokens are returned when tokens are equivalent',
    expected: {mtokens: '1000'},
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, ({equal, end, throws}) => {
    if (!!error) {
      throws(() => mtokensAmount(args), new Error(error), 'Got expected err');
    } else {
      const {mtokens} = mtokensAmount(args);

      equal(mtokens, expected.mtokens, 'Got expected output');
    }

    return end();
  });
});
