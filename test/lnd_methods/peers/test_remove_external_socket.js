const {test} = require('@alexbosworth/tap');

const {removeExternalSocket} = require('./../../../');

const makeLnd = ({err}) => {
  return {peers: {updateNodeAnnouncement: (args, cbk) => cbk(err)}};
};

const makeArgs = overrides => {
  const args = {lnd: makeLnd({}), socket: '127.0.0.1:9735'};

  Object.keys(overrides).forEach(key => args[key] = overrides[key]);

  return args;
};

const tests = [
  {
    args: makeArgs({lnd: undefined}),
    description: 'LND is required to remove an external socket',
    error: [400, 'ExpectedLndToRemoveExternalSocket'],
  },
  {
    args: makeArgs({socket: undefined}),
    description: 'A socket is required to remove an external socket',
    error: [400, 'ExpectedHostAndPortOfSocketToRemove'],
  },
  {
    args: makeArgs({
      lnd: makeLnd({err: {details: 'unknown service peersrpc.Peers'}}),
    }),
    description: 'LND with peersrpc is required to add an external socket',
    error: [400, 'ExpectedPeersRpcLndBuildTagToRemoveSocket'],
  },
  {
    args: makeArgs({lnd: makeLnd({err: 'err'})}),
    description: 'LND error is returned',
    error: [503, 'UnexpectedErrorRemovingExternalSocket', {err: 'err'}],
  },
  {
    args: makeArgs({}),
    description: 'Socket removed successfully',
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({deepEqual, end, equal, rejects}) => {
    if (!!error) {
      await rejects(() => removeExternalSocket(args), error, 'Got error');
    } else {
      await removeExternalSocket(args);
    }

    return end();
  });
});
