const {test} = require('@alexbosworth/tap');

const {getNetworkInfo} = require('./../../../');

const tests = [
  {
    args: {lnd: undefined},
    description: 'LND is required to get network info',
    error: [400, 'ExpectedLndForNetworkInfoRequest'],
  },
  {
    args: {lnd: {default: {getNetworkInfo: ({}, cbk) => cbk('err')}}},
    description: 'Errors from get network info are passed back',
    error: [503, 'UnexpectedGetNetworkInfoError', {err: 'err'}],
  },
  {
    args: {lnd: {default: {getNetworkInfo: ({}, cbk) => cbk()}}},
    description: 'Errors validating get network info are returned',
    error: [503, 'ExpectedRpcNetworkInfo'],
  },
  {
    args: {
      lnd: {
        default: {
          getNetworkInfo: ({}, cbk) => cbk(null, {
            avg_channel_size: 1,
            max_channel_size: '1',
            median_channel_size_sat: '1',
            min_channel_size: '1',
            num_channels: 1,
            num_nodes: 1,
            num_zombie_chans: '1',
            total_network_capacity: '1',
          }),
        },
      },
    },
    description: 'Network info is returned',
    expected: {
      average_channel_size: 1,
      channel_count: 1,
      max_channel_size: 1,
      median_channel_size: 1,
      min_channel_size: 1,
      node_count: 1,
      not_recently_updated_policy_count: 1,
      total_capacity: 1,
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, rejects, strictSame}) => {
    if (!!error) {
      await rejects(() => getNetworkInfo(args), error, 'Got error');
    } else {
      strictSame(await getNetworkInfo(args), expected, 'Got expected res');
    }

    return end();
  });
});
