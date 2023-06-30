const {equal} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

const grpcCredentials = require('./../../lnd_grpc/grpc_credentials');

const tests = [
  {
    args: {macaroon: '00'},
    description: 'gRPC credentials are returned',
    expected: {},
  },
];

tests.forEach(({args, error, description}) => {
  return test(description, (t, end) => {
    if (!!error) {
      throws(() => grpcCredentials(args), new Error(error), 'Got error');
    } else {
      equal(!!grpcCredentials(args).credentials, true, 'Got credentials');
    }

    return end();
  });
});
