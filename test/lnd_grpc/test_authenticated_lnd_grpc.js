const {test} = require('@alexbosworth/tap');

const {authenticatedLndGrpc} = require('./../../');

const expectedServices = [
  'autopilot',
  'chain',
  'default',
  'invoices',
  'peers',
  'router',
  'signer',
  'tower_client',
  'tower_server',
  'version',
  'wallet',
];

const tests = [
  {
    args: {macaroon: Buffer.alloc(1).toString('hex')},
    description: 'An authenticated LND gRPC Object is returned',
    expected: {services: expectedServices},
  },
  {
    args: {cert: '00', macaroon: Buffer.alloc(1).toString('hex')},
    description: 'Passing a cert for the authenticated LND grpc is supported',
    expected: {services: expectedServices},
  },
];

tests.forEach(({args, description, expected}) => {
  return test(description, async ({end, equal, strictSame}) => {
    const {lnd} = authenticatedLndGrpc(args);

    equal(!!lnd, true, 'Got LND object');
    strictSame(Object.keys(lnd), expected.services, 'Got expected services');

    return end();
  });
});
