const {test} = require('tap');

const grpcRouter = require('./../../lnd_gateway/grpc_router');

const tests = [
  {
    args: {},
    description: 'A gRPC gateway router is returned',
    expected: {type: 'function'},
  },
];

tests.forEach(({args, description, expected}) => {
  return test(description, ({end, type}) => {
    type(grpcRouter({}), expected.type, 'Got expected result type');

    return end();
  });
});
