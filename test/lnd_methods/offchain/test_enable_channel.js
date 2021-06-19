const {test} = require('@alexbosworth/tap');

const {enableChannel} = require('./../../../lnd_methods');

const makeLnd = err => {
  return {router: {updateChanStatus: ({}, cbk) => cbk(err)}};
};

const makeArgs = override => {
  const args = {
    lnd: makeLnd(),
    transaction_id: Buffer.alloc(32).toString('hex'),
    transaction_vout: 0,
  };

  Object.keys(override || {}).forEach(key => args[key] = override[key]);

  return args;
};

const tests = [
  {
    args: makeArgs({lnd: undefined}),
    description: 'LND is required',
    error: [400, 'ExpectedAuthenticatedLndToEnableChannel'],
  },
  {
    args: makeArgs({transaction_id: undefined}),
    description: 'A channel funding tx id is required',
    error: [400, 'ExpectedChannelFundingTxIdToEnableChannel'],
  },
  {
    args: makeArgs({transaction_vout: undefined}),
    description: 'A channel funding tx vout is required',
    error: [400, 'ExpectedChannelFundingTxVoutToEnableChannel'],
  },
  {
    args: makeArgs({
      lnd: makeLnd({details: '12 UNIMPLEMENTED: unknown service'}),
    }),
    description: 'Unimplemented error is returned',
    error: [501, 'EnableChannelMethodNotSupported'],
  },
  {
    args: makeArgs({lnd: makeLnd('err')}),
    description: 'Server error is returned',
    error: [503, 'UnexpectedErrorEnablingChannel', {err: 'err'}],
  },
  {
    args: makeArgs({
      lnd: {
        router: {
          updateChanStatus: (args, cbk) => {
            // Return an error after the initial force enable
            return args.action === 'ENABLE' ? cbk() : cbk('err');
          },
        },
      },
    }),
    description: 'Server error is returned when setting channel to auto',
    error: [503, 'UnexpectedErrorSettingChanToAutoEnable', {err: 'err'}],
  },
  {
    args: makeArgs({}),
    description: 'Channel is enabled',
  },
  {
    args: makeArgs({is_force_enable: true}),
    description: 'Channel is force enabled',
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, equal, rejects}) => {
    if (!!error) {
      await rejects(enableChannel(args), error, 'Got expected error');
    } else {
      await enableChannel(args);
    }

    return end();
  });
});
