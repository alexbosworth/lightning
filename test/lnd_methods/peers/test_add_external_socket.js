const {rejects} = require('node:assert').strict;
const test = require('node:test');

const {addExternalSocket} = require('./../../../');

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
    description: 'LND is required to add an external socket',
    error: [400, 'ExpectedLndToAddExternalSocket'],
  },
  {
    args: makeArgs({socket: undefined}),
    description: 'A socket is required to add an external socket',
    error: [400, 'ExpectedHostAndPortOfSocketToAdd'],
  },
  {
    args: makeArgs({
      lnd: makeLnd({err: {details: 'unknown service peersrpc.Peers'}}),
    }),
    description: 'LND with peersrpc is required to add an external socket',
    error: [400, 'ExpectedPeersRpcLndBuildTagToAddSocket'],
  },
  {
    args: makeArgs({lnd: makeLnd({err: 'err'})}),
    description: 'LND error is returned',
    error: [503, 'UnexpectedErrorAddingExternalSocket', {err: 'err'}],
  },
  {
    args: makeArgs({}),
    description: 'Socket added successfully',
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async () => {
    if (!!error) {
      await rejects(() => addExternalSocket(args), error, 'Got error');
    } else {
      await addExternalSocket(args);
    }

    return;
  });
});
