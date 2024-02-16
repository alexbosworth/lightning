const {rejects} = require('node:assert').strict;
const test = require('node:test');

const {addAdvertisedFeature} = require('./../../../');

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
    description: 'A feature is required to add an advertised feature',
    error: [400, 'ExpectedFeatureToAddAnnouncementFeature'],
  },
  {
    args: makeArgs({lnd: undefined}),
    description: 'LND is required to add an advertised feature',
    error: [400, 'ExpectedLndToAddNodeAnnouncementFeature'],
  },
  {
    args: makeArgs({
      lnd: makeLnd({err: {details: 'unknown service peersrpc.Peers'}}),
    }),
    description: 'LND with peersrpc is required to add an advertised feature',
    error: [400, 'ExpectedPeersRpcLndBuildTagToUpdateFeatures'],
  },
  {
    args: makeArgs({lnd: makeLnd({err: 'err'})}),
    description: 'LND error is returned',
    error: [503, 'UnexpectedErrorUpdatingNodeFeatures', {err: 'err'}],
  },
  {
    args: makeArgs({}),
    description: 'Feature added successfully',
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async () => {
    if (!!error) {
      await rejects(() => addAdvertisedFeature(args), error, 'Got error');
    } else {
      await addAdvertisedFeature(args);
    }

    return;
  });
});
