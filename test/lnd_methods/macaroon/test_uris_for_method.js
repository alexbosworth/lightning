const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

const method = require('./../../../lnd_methods/macaroon/uris_for_method');
const methods = require('./../../../lnd_methods/macaroon/methods');

const tests = [
  {
    args: {},
    description: 'A method is required',
    error: 'ExpectedMethodNameToDeriveMacaroonUris',
  },
  {
    args: {method: 'unknown'},
    description: 'A known method is required',
    error: 'ExpectedKnownMethodNameToDeriveMacaroonUris',
  },
  {
    args: {method: 'getPayment'},
    description: 'Router server URI is returned',
    expected: {uris: ['/routerrpc.Router/TrackPaymentV2']},
  },
  {
    args: {method: 'grantAccess'},
    description: 'Method URI is returned',
    expected: {uris: ['/lnrpc.Lightning/BakeMacaroon']},
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, (t, end) => {
    if (!!error) {
      throws(() => method(args), new Error(error), 'Got expected error');
    } else {
      const res = method(args);

      deepStrictEqual(res, expected, 'Got expected result');
    }

    // Run through all the methods to make sure they can be derived
    Object.keys(methods).forEach(n => method({method: n}));

    return end();
  });
});
