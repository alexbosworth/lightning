const {test} = require('@alexbosworth/tap');

const grpcCredentials = require('./../../lnd_grpc/grpc_credentials');

const tests = [
  {
    args: {macaroon: '00'},
    description: 'gRPC credentials are returned',
    expected: {},
  },
];

tests.forEach(({args, error, description}) => {
  return test(description, async ({end, equal, throws}) => {
    if (!!error) {
      throws(() => grpcCredentials(args), new Error(error), 'Got error');
    } else {
      equal(!!grpcCredentials(args).credentials, true, 'Got credentials');
    }

    return end();
  });
});
