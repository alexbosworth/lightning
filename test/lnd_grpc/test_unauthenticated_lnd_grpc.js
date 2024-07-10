const {deepStrictEqual} = require('node:assert').strict;
const {equal} = require('node:assert').strict;
const {join} = require('path');
const test = require('node:test');

const {unauthenticatedLndGrpc} = require('./../../');

const expectedServices = ['status', 'unlocker'];

const tests = [
  {
    args: {},
    description: 'An authenticated LND gRPC Object is returned',
    expected: {services: expectedServices},
  },
  {
    args: {cert: '00'},
    description: 'Passing a cert for the authenticated LND grpc is supported',
    expected: {services: expectedServices},
  },
  {
    args: {path: join(__dirname, '../../grpc/protos')},
    description: 'The path can be specified',
    expected: {services: expectedServices},
  },
];

tests.forEach(({args, description, expected}) => {
  return test(description, (t, end) => {
    const {lnd} = unauthenticatedLndGrpc(args);

    equal(!!lnd, true, 'Got LND object');
    deepStrictEqual(Object.keys(lnd), expected.services, 'Got services');

    return end();
  });
});
