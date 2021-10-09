const {test} = require('@alexbosworth/tap');

const method = require('./../../../lnd_methods/macaroon/reject_rpc_request');

const tests = [
  {
    args: {},
    description: 'A request id is required to reject an RPC request',
    error: [400, 'ExpectedRequestIdToRejectRpcRequest'],
  },
  {
    args: {id: 1},
    description: 'A subscription is required to reject an RPC request',
    error: [400, 'ExpectedRpcSubscriptionToRejectRpcRequest'],
  },
  {
    args: {id: 1, subscription: {write: ({}, cbk) => cbk('err')}},
    description: 'Request error passed back',
    error: [503, 'UnexpectedErrorRejectingRpcRequest', {err: 'err'}],
  },
  {
    args: {id: 1, subscription: {write: ({}, cbk) => cbk()}},
    description: 'Request accepted',
  },
  {
    args: {id: 1, message: 'msg', subscription: {write: ({}, cbk) => cbk()}},
    description: 'Request accepted with message',
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
