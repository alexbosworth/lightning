const {test} = require('@alexbosworth/tap');

const method = require('./../../../lnd_methods/macaroon/accept_rpc_request');

const tests = [
  {
    args: {},
    description: 'A request id is required to accept an RPC request',
    error: [400, 'ExpectedRequestIdToAcceptRpcRequest'],
  },
  {
    args: {id: 1},
    description: 'A subscription is required to accept an RPC request',
    error: [400, 'ExpectedRpcSubscriptionToAcceptRpcRequest'],
  },
  {
    args: {id: 1, subscription: {write: ({}, cbk) => cbk('err')}},
    description: 'Request error passed back',
    error: [503, 'UnexpectedErrorAcceptingRpcRequest', {err: 'err'}],
  },
  {
    args: {id: 1, subscription: {write: ({}, cbk) => cbk()}},
    description: 'Request accepted',
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, equal, rejects}) => {
    if (!!error) {
      await rejects(() => method(args), error, 'Got expected error');
    } else {
      await method(args);
    }

    return end();
  });
});
