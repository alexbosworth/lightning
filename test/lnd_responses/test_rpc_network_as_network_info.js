const {test} = require('@alexbosworth/tap');

const {rpcNetworkAsNetworkInfo} = require('./../../lnd_responses');

const makeInfo = overrides => {
  const details = {
    avg_channel_size: 1,
    max_channel_size: '1',
    median_channel_size_sat: '1',
    min_channel_size: '1',
    num_channels: 1,
    num_nodes: 1,
    num_zombie_chans: '1',
    total_network_capacity: '1',
  };

  Object.keys(overrides).forEach(key => details[key] = overrides[key]);

  return details;
};

const tests = [
  {
    description: 'Network info is expected',
    error: 'ExpectedRpcNetworkInfo',
  },
  {
    args: makeInfo({avg_channel_size: undefined}),
    description: 'Average channel size is expected',
    error: 'ExpectedAvgChannelSize',
  },
  {
    args: makeInfo({max_channel_size: undefined}),
    description: 'Max channel size is expected',
    error: 'ExpectedMaxChannelSize',
  },
  {
    args: makeInfo({median_channel_size_sat: undefined}),
    description: 'Median channel size is expected',
    error: 'ExpectedMedianChannelSizeInNetworkInfo',
  },
  {
    args: makeInfo({min_channel_size: undefined}),
    description: 'Min channel size is expected',
    error: 'ExpectedMinChannelSize',
  },
  {
    args: makeInfo({num_channels: undefined}),
    description: 'Total channels count is expected',
    error: 'ExpectedNumChannels',
  },
  {
    args: makeInfo({num_nodes: undefined}),
    description: 'Total node count is expected',
    error: 'ExpectedNumNodes',
  },
  {
    args: makeInfo({num_zombie_chans: undefined}),
    description: 'Total zombie channels is expected',
    error: 'ExpectedNumberOfZombieChannelsInNetworkInfo',
  },
  {
    args: makeInfo({total_network_capacity: undefined}),
    description: 'Total network capacity is expected',
    error: 'ExpectedTotalNetworkCapacity',
  },
  {
    args: makeInfo({}),
    description: 'Network details are mapped',
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
  return test(description, ({end, strictSame, throws}) => {
    if (!!error) {
      throws(() => rpcNetworkAsNetworkInfo(args), new Error(error), 'Got err');
    } else {
      strictSame(rpcNetworkAsNetworkInfo(args), expected, 'Got network info');
    }

    return end();
  });
});
