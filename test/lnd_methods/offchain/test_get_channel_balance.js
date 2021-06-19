const {test} = require('@alexbosworth/tap');

const {getChannelBalance} = require('./../../../');

const makeLnd = overrides => {
  const res = {
    balance: '1',
    local_balance: {msat: '1000', sat: '1'},
    pending_open_balance: '1',
    pending_open_local_balance: {msat: '1000', sat: '1'},
    pending_open_remote_balance: {msat: '1000', sat: '1'},
    remote_balance: {msat: '1000', sat: '1'},
    unsettled_local_balance: {msat: '1000', sat: '1'},
    unsettled_remote_balance: {msat: '1000', sat: '1'},
  };

  Object.keys(overrides).forEach(k => res[k] = overrides[k]);

  return {default: {channelBalance: ({}, cbk) => cbk(null, res)}};
};

const tests = [
  {
    args: {},
    description: 'LND is required',
    error: [400, 'ExpectedLndGrpcApiForChannelBalanceQuery'],
  },
  {
    args: {lnd: {default: {channelBalance: ({}, cbk) => cbk('err')}}},
    description: 'An error from LND is passed back',
    error: [503, 'UnexpectedGetChannelBalanceError', {err: 'err'}],
  },
  {
    args: {lnd: {default: {channelBalance: ({}, cbk) => cbk()}}},
    description: 'A result is expected',
    error: [503, 'ExpectedGetChannelBalanceResponse'],
  },
  {
    args: {lnd: makeLnd({balance: undefined})},
    description: 'A channel balance number is expected',
    error: [503, 'ExpectedChannelBalance'],
  },
  {
    args: {lnd: makeLnd({pending_open_balance: undefined})},
    description: 'A pending open balance is expected',
    error: [503, 'ExpectedPendingOpenBalance'],
  },
  {
    args: {lnd: makeLnd({local_balance: {msat: '1'}})},
    description: 'Local balance tokens are expected',
    error: [503, 'ExpectedLocalChannelBalanceSatsInResponse'],
  },
  {
    args: {lnd: makeLnd({local_balance: {sat: '1'}})},
    description: 'Local balance mtokens are expected',
    error: [503, 'ExpectedLocalChannelBalanceMSatsInResponse'],
  },
  {
    args: {lnd: makeLnd({pending_open_local_balance: undefined})},
    description: 'Pending open local balance is expected',
    error: [503, 'ExpectedPendingOpenChannelBalanceInResponse'],
  },
  {
    args: {lnd: makeLnd({pending_open_local_balance: {msat: '1'}})},
    description: 'Pending local balance tokens are expected',
    error: [503, 'ExpectedPendingOpenBalanceSatsInResponse'],
  },
  {
    args: {lnd: makeLnd({pending_open_local_balance: {sat: '1'}})},
    description: 'Pending local balance tokens are expected',
    error: [503, 'ExpectedPendingOpenBalanceMSatsInResponse'],
  },
  {
    args: {lnd: makeLnd({pending_open_remote_balance: undefined})},
    description: 'Pending open remote balance is expected',
    error: [503, 'ExpectedPendingRemoteChannelBalanceInResponse'],
  },
  {
    args: {lnd: makeLnd({pending_open_remote_balance: {msat: '1'}})},
    description: 'Pending open remote balance tokens are expected',
    error: [503, 'ExpectedPendingOpenRemoteBalanceSatsInResponse'],
  },
  {
    args: {lnd: makeLnd({pending_open_remote_balance: {sat: '1'}})},
    description: 'Pending open remote balance mtokens are expected',
    error: [503, 'ExpectedPendingOpenRemoteBalanceMSatsInResponse'],
  },
  {
    args: {lnd: makeLnd({remote_balance: undefined})},
    description: 'Remote balance is expected',
    error: [503, 'ExpectedRemoteChannelBalanceInResponse'],
  },
  {
    args: {lnd: makeLnd({remote_balance: {sat: '1'}})},
    description: 'Remote balance tokens are expected',
    error: [503, 'ExpectedRemoteChannelBalanceMSatsInResponse'],
  },
  {
    args: {lnd: makeLnd({remote_balance: {msat: '1'}})},
    description: 'Remote balance mtokens are expected',
    error: [503, 'ExpectedRemoteChannelBalanceSatsInResponse'],
  },
  {
    args: {lnd: makeLnd({local_balance: undefined})},
    description: 'Channel balances are returned',
    expected: {channel_balance: 1, pending_balance: 1},
  },
  {
    args: {lnd: makeLnd({unsettled_local_balance: undefined})},
    description: 'Unsettled balance is expected',
    error: [503, 'ExpectedUnsettledLocalChannelBalanceInResponse'],
  },
  {
    args: {lnd: makeLnd({unsettled_local_balance: {sat: '1'}})},
    description: 'Unsettled balance tokens are expected',
    error: [503, 'ExpectedUnsettledLocalBalanceMSatsInResponse'],
  },
  {
    args: {lnd: makeLnd({unsettled_local_balance: {msat: '1'}})},
    description: 'Unsettled balance millitokens are expected',
    error: [503, 'ExpectedUnsettledLocalBalanceSatsInResponse'],
  },
  {
    args: {lnd: makeLnd({unsettled_remote_balance: undefined})},
    description: 'Unsettled remote balance is expected',
    error: [503, 'ExpectedUnsettledRemoteChannelBalanceInResponse'],
  },
  {
    args: {lnd: makeLnd({unsettled_remote_balance: {sat: '1'}})},
    description: 'Unsettled remote balance tokens are expected',
    error: [503, 'ExpectedUnsettledRemoteBalanceSatsInResponse'],
  },
  {
    args: {lnd: makeLnd({unsettled_remote_balance: {msat: '1'}})},
    description: 'Unsettled remote balance millitokens are expected',
    error: [503, 'ExpectedUnsettledRemoteBalanceSatsInResponse'],
  },
  {
    args: {lnd: makeLnd({})},
    description: 'Extended channel balances are returned',
    expected: {
      channel_balance: 1,
      channel_balance_mtokens: '1000',
      inbound: 1,
      inbound_mtokens: '1000',
      pending_balance: 1,
      pending_inbound: 1,
      unsettled_balance: 1,
      unsettled_balance_mtokens: '1000',
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, rejects, strictSame}) => {
    if (!!error) {
      rejects(() => getChannelBalance(args), error, 'Got expected error');
    } else {
      const balances = await getChannelBalance(args);

      strictSame(balances, expected, 'Got channel balances');
    }

    return end();
  });
});
