const {test} = require('@alexbosworth/tap');

const {updateColor} = require('./../../../');

const makeLnd = ({err}) => {
  return {peers: {updateNodeAnnouncement: (args, cbk) => cbk(err)}};
};

const makeArgs = overrides => {
  const args = {color: '#012345', lnd: makeLnd({})};

  Object.keys(overrides).forEach(key => args[key] = overrides[key]);

  return args;
};

const tests = [
  {
    args: makeArgs({color: undefined}),
    description: 'A color is required to update color to',
    error: [400, 'ExpectedColorToUpdateNodeAnnouncementColor'],
  },
  {
    args: makeArgs({lnd: undefined}),
    description: 'LND is required to update color',
    error: [400, 'ExpectedLndToUpdateNodeAnnouncementColor'],
  },
  {
    args: makeArgs({
      lnd: makeLnd({err: {details: 'unknown service peersrpc.Peers'}}),
    }),
    description: 'LND with peersrpc is required to update color',
    error: [400, 'ExpectedPeersRpcLndBuildTagToUpdateColor'],
  },
  {
    args: makeArgs({lnd: makeLnd({err: 'err'})}),
    description: 'LND error is returned',
    error: [503, 'UnexpectedErrorUpdatingNodeColor', {err: 'err'}],
  },
  {
    args: makeArgs({}),
    description: 'Color updated successfully',
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({deepEqual, end, equal, rejects}) => {
    if (!!error) {
      await rejects(() => updateColor(args), error, 'Got error');
    } else {
      await updateColor(args);
    }

    return end();
  });
});
