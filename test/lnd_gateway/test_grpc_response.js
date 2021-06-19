const {test} = require('@alexbosworth/tap');

const grpcResponse = require('./../../lnd_gateway/grpc_response');

const tests = [
  {
    args: {credentials: {}},
    description: 'Middleware attempts unauthenticated request',
    expected: {},
  },
  {
    args: {credentials: {socket: 'socket'}, locals: {auth: {bearer: '00'}}},
    description: 'Middleware attempts authenticated socket request',
    expected: {},
  },
];

tests.forEach(({args, description, expected}) => {
  return test(description, ({end}) => {
    const locals = args.locals || {};
    const {middleware} = grpcResponse(args);

    const res = {locals, send: () => {}, status: () => {}, type: () => {}};

    middleware({params: {}}, res);

    return end();
  });
});
