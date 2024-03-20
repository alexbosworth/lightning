const {rejects} = require('node:assert').strict;
const test = require('node:test');

const {removeAdvertisedFeature} = require('./../../../');

const makeLnd = ({err}) => {
  return {peers: {updateNodeAnnouncement: (args, cbk) => cbk(err)}};
};

const makeArgs = overrides => {
  const args = {feature: 127, lnd: makeLnd({})};

  Object.keys(overrides).forEach(key => args[key] = overrides[key]);

  return args;
};

const tests = [
  {
    args: makeArgs({feature: undefined}),
    description: 'A feature is required to remove an advertised feature',
    error: [400, 'ExpectedFeatureToRemoveAnnouncementFeature'],
  },
  {
    args: makeArgs({lnd: undefined}),
    description: 'LND is required to remove an advertised feature',
    error: [400, 'ExpectedLndToRemoveNodeAnnouncementFeature'],
  },
  {
    args: makeArgs({
      lnd: makeLnd({err: {details: 'unknown service peersrpc.Peers'}}),
    }),
    description: 'LND with peersrpc is required to remove a feature',
    error: [400, 'ExpectedPeersRpcLndBuildTagToRemoveFeature'],
  },
  {
    args: makeArgs({lnd: makeLnd({err: 'err'})}),
    description: 'LND error is returned',
    error: [503, 'UnexpectedErrorRemovingNodeFeature', {err: 'err'}],
  },
  {
    args: makeArgs({}),
    description: 'Feature removed successfully',
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async () => {
    if (!!error) {
      await rejects(() => removeAdvertisedFeature(args), error, 'Got error');
    } else {
      await removeAdvertisedFeature(args);
    }

    return;
  });
});
