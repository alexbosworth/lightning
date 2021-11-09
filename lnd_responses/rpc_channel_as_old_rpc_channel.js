const {adjustedChannelTypes} = require('./constants');
const {defaultChannelType} = require('./constants');
const {oldChannelVersions} = require('./constants');

const {assign} = Object;

/** Map RPC channel fields into the legacy RPC channel fields as needed

  {
    channel: {
      [commitment_type]: <Channel Commitment Type String>
    }
    [version]: <Wallet Version String>
  }

  @returns
  <Updated Channel Object>
*/
module.exports = ({channel, version}) => {
  if (!oldChannelVersions.includes(version)) {
    return channel;
  }

  const type = adjustedChannelTypes[channel.commitment_type];

  // Versions of LND 0.13.4 and before use a different channel type value
  return assign(channel, {commitment_type: type || defaultChannelType});
};
