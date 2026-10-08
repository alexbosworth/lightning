const {strictEqual} = require('node:assert').strict;
const test = require('node:test');

const method = require('./../../../lnd_methods/info/is_connection_failure');

const tests = [
  {
    args: {},
    description: 'No error is not a connection failure',
    expected: false,
  },
  {
    args: {err: {code: 14}},
    description: 'Unavailable status code is a connection failure',
    expected: true,
  },
  {
    args: {err: {details: 'No connection established. Last error: x'}},
    description: 'Known details message is a connection failure',
    expected: true,
  },
  {
    args: {err: {message: '13 INTERNAL: read ECONNRESET'}},
    description: 'Known message is matched case insensitively',
    expected: true,
  },
  {
    args: {err: {code: 2, details: 'unexpected error'}},
    description: 'Other errors are not connection failures',
    expected: false,
  },
];

tests.forEach(({args, description, expected}) => {
  return test(description, (t, end) => {
    strictEqual(method(args), expected, 'Got expected result');

    return end();
  });
});
