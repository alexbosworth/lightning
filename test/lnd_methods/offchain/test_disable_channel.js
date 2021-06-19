const {test} = require('@alexbosworth/tap');

const {disableChannel} = require('./../../../lnd_methods');

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
    error: [400, 'ExpectedAuthenticatedLndToDisableChannel'],
  },
  {
    args: makeArgs({transaction_id: undefined}),
    description: 'A channel funding tx id is required',
    error: [400, 'ExpectedChannelFundingTxIdToDisableChannel'],
  },
  {
    args: makeArgs({transaction_vout: undefined}),
    description: 'A channel funding tx vout is required',
    error: [400, 'ExpectedChannelFundingTxVoutToDisableChannel'],
  },
  {
    args: makeArgs({
      lnd: makeLnd({details: '12 UNIMPLEMENTED: unknown service'}),
    }),
    description: 'Unimplemented error is returned',
    error: [501, 'DisableChannelMethodNotSupported'],
  },
  {
    args: makeArgs({lnd: makeLnd('err')}),
    description: 'Server error is returned',
    error: [503, 'UnexpectedErrorDisablingChannel', {err: 'err'}],
  },
  {
    args: makeArgs({}),
    description: 'Channel is disabled',
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, equal, rejects}) => {
    if (!!error) {
      await rejects(disableChannel(args), error, 'Got expected error');
    } else {
      await disableChannel(args);
    }

    return end();
  });
});
