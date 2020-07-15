const {test} = require('@alexbosworth/tap');

const {fundPendingChannels} = require('./../../../lnd_methods');

const id = Buffer.alloc(32).toString('hex');

const makeLnd = ({finalizeErr, verifyErr}) => {
  return {
    default: {
      fundingStateStep: (args, cbk) => {
        if (!!args.psbt_finalize && !!finalizeErr) {
          return cbk(finalizeErr);
        }

        if (!!args.psbt_verify && !!verifyErr) {
          return cbk(verifyErr);
        }

        return cbk();
      },
    },
  };
};

const makeArgs = overrides => {
  const args = {channels: [id], funding: '01', lnd: makeLnd({})};

  Object.keys(overrides).forEach(key => args[key] = overrides[key]);

  return args;
};

const tests = [
  {
    args: makeArgs({channels: undefined}),
    description: 'Channels are expected',
    error: [400, 'ExpectedPendingChannelIdsToFundChannels'],
  },
  {
    args: makeArgs({channels: []}),
    description: 'Some pending channels is expected',
    error: [400, 'ExpectedPendingChannelIdsToFund'],
  },
  {
    args: makeArgs({channels: [null]}),
    description: 'Non empty pending channels is expected',
    error: [400, 'ExpectedNonEmptyPendingChannelIdsToFund'],
  },
  {
    args: makeArgs({channels: ['00']}),
    description: 'Non empty pending channels is expected',
    error: [400, 'ExpectedPendingChannelIdOfChannelToFund'],
  },
  {
    args: makeArgs({funding: undefined}),
    description: 'Funding is expected',
    error: [400, 'ExpectedFundingPsbtToFundChannel'],
  },
  {
    args: makeArgs({lnd: undefined}),
    description: 'LND is expected',
    error: [400, 'ExpectedAuthenticatedLndToFundChannels'],
  },
  {
    args: makeArgs({lnd: makeLnd({verifyErr: 'err'})}),
    description: 'Verify errors are passed back',
    error: [503, 'UnexpectedErrorValidatingChanFunding', {err: 'err'}],
  },
  {
    args: makeArgs({lnd: makeLnd({finalizeErr: 'err'})}),
    description: 'Finalize errors are passed back',
    error: [503, 'UnexpectedErrorFinalizingChanFunding', {err: 'err'}],
  },
  {
    args: makeArgs({}),
    description: 'Channel funding is executed',
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({deepEqual, end, equal, rejects}) => {
    if (!!error) {
      await rejects(fundPendingChannels(args), error, 'Got error');
    } else {
      await fundPendingChannels(args);
    }

    return end();
  });
});
