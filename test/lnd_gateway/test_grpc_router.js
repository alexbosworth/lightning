const {equal} = require('node:assert').strict;
const test = require('node:test');

const {grpcRouter} = require('./../../');

const tests = [
  {
    args: {},
    description: 'A gRPC gateway router is returned',
    expected: {type: 'function'},
  },
];

tests.forEach(({args, description, expected}) => {
  return test(description, (t, end) => {
    equal(typeof grpcRouter({}), expected.type, 'Got expected result type');

    return end();
  });
});
