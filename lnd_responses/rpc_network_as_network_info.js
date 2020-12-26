const isNumber = n => !isNaN(n);
const isString = n => typeof n === 'string';

/** Derive network info details from network info message

  {
    avg_channel_size: <Average Channel Capacity Tokens Number>
    max_channel_size: <Maximum Channel Capacity Tokens String>
    median_channel_size_sat: <Median Channel Capacity Tokens String>
    min_channel_size: <Minimum Channel Capacity Tokens String>
    num_channels: <Channels Count Number>
    num_nodes: <Node Count Number>
    num_zombie_chans: <Number of Zombie Channels Count String>
    total_network_capacity: <Total Network Tokens String>
  }

  @throws
  <Error>

  @returns
  {
    average_channel_size: <Tokens Number>
    channel_count: <Channels Count Number>
    max_channel_size: <Tokens Number>
    median_channel_size: <Median Channel Tokens Number>
    min_channel_size: <Tokens Number>
    node_count: <Node Count Number>
    not_recently_updated_policy_count: <Channel Edge Count Number>
    total_capacity: <Total Capacity Number>
  }
*/
module.exports = networkInfo => {
  if (!networkInfo) {
    throw new Error('ExpectedRpcNetworkInfo');
  }

  if (!isNumber(networkInfo.avg_channel_size)) {
    throw new Error('ExpectedAvgChannelSize');
  }

  if (!isString(networkInfo.max_channel_size)) {
    throw new Error('ExpectedMaxChannelSize');
  }

  if (!networkInfo.median_channel_size_sat) {
    throw new Error('ExpectedMedianChannelSizeInNetworkInfo');
  }

  if (!isString(networkInfo.min_channel_size)) {
    throw new Error('ExpectedMinChannelSize');
  }

  if (!isNumber(networkInfo.num_channels)) {
    throw new Error('ExpectedNumChannels');
  }

  if (!isNumber(networkInfo.num_nodes)) {
    throw new Error('ExpectedNumNodes');
  }

  if (!isString(networkInfo.num_zombie_chans)) {
    throw new Error('ExpectedNumberOfZombieChannelsInNetworkInfo');
  }

  if (!isString(networkInfo.total_network_capacity)) {
    throw new Error('ExpectedTotalNetworkCapacity');
  }

  return {
    average_channel_size: networkInfo.avg_channel_size,
    channel_count: networkInfo.num_channels,
    max_channel_size: Number(networkInfo.max_channel_size),
    median_channel_size: Number(networkInfo.median_channel_size_sat),
    min_channel_size: Number(networkInfo.min_channel_size),
    node_count: networkInfo.num_nodes,
    not_recently_updated_policy_count: Number(networkInfo.num_zombie_chans),
    total_capacity: Number(networkInfo.total_network_capacity),
  };
};
