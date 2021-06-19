const {test} = require('@alexbosworth/tap');

const {getPendingChannels} = require('./../../../');

const expectedChannel = {
};

const makeLnd = ({err, res}) => {
  return {
    default: {
      pendingChannels: ({}, cbk) => cbk(err, res || {
        pending_force_closing_channels: [],
        pending_open_channels: [],
        waiting_close_channels: [],
      }),
    },
  };
};

const tests = [
  {
    args: {},
    description: 'LND is required',
    error: [400, 'ExpectedLndForPendingChannelsRequest'],
  },
  {
    args: {lnd: makeLnd({err: 'err'})},
    description: 'Errors are passed back',
    error: [503, 'UnexpectedPendingChannelsErr', {err: 'err'}],
  },
  {
    args: {lnd: makeLnd({res: {}})},
    description: 'Invalid pending channel result is returned',
    error: [503, 'ExpectedPendingForceCloseChannels'],
  },
  {
    args: {lnd: makeLnd({})},
    description: 'Pendng channels are returned',
    expected: {pending_channels: []},
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, rejects, strictSame}) => {
    if (!!error) {
      await rejects(() => getPendingChannels(args), error, 'Got expected err');
    } else {
      const pending = await getPendingChannels(args);

      strictSame(pending, expected, 'Got expected pending channels');
    }

    return end();
  });
});
