const {chanFormat} = require('bolt07');

const notFoundIndex = -1;

/** Determine which public keys were associated with a payment route failure

  {
    [failure]: {
      channel_update: {
        chan_id: <Numeric Format Channel Id String>
      }
    }
    route: {
      hops: [{
        channel: <Standard Format Channel Id String>
        public_key: <Public Key Hex String>
      }]
    }
  }

  @returns
  {
    [keys]: [<Public Key Hex String>]
  }
*/
module.exports = ({failure, route}) => {
  // Exit early when there is no failure to derive failure keys for
  if (!failure) {
    return {};
  }

  // Exit early when no specific failure is returned
  if (!failure.channel_update || !failure.channel_update.chan_id) {
    return {};
  }

  const {channel} = chanFormat({number: failure.channel_update.chan_id});

  const hopIndex = route.hops.findIndex(n => n.channel === channel);

  // Exit early when there are no keys, or the failure is from a direct peer
  if (!hopIndex || hopIndex === notFoundIndex) {
    return {};
  }

  const hops = [route.hops[hopIndex], route.hops[hopIndex - [failure].length]];

  return {keys: hops.filter(n => !!n).map(hop => hop.public_key)};
};
