const {test} = require('tap');

const {unauthenticatedLndGrpc} = require('./../../');

const expectedServices = ['unlocker'];

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
];

tests.forEach(({args, description, expected}) => {
  return test(description, async ({deepIs, end, equal}) => {
    const {lnd} = unauthenticatedLndGrpc(args);

    equal(!!lnd, true, 'Got LND object');
    deepIs(Object.keys(lnd), expected.services, 'Got expected services');

    return end();
  });
});
