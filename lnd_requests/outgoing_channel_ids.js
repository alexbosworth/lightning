const {chanNumber} = require('bolt07');

const {isArray} = Array;

/** Derive the outgoing channel id constraints for a route query

  {
    [outgoing_channel]: <Outgoing Channel Id String>
    [outgoing_channels]: [<Outgoing Channel Id String>]
  }

  @throws
  <Error>

  @returns
  {
    [ids]: [<Outgoing Channel Number String>]
  }
*/
module.exports = ({outgoing_channel, outgoing_channels}) => {
  if (!!outgoing_channels && !isArray(outgoing_channels)) {
    throw new Error('ExpectedArrayOfOutgoingChannelIds');
  }

  const channels = outgoing_channels || [];
  const single = [outgoing_channel].filter(n => !!n);

  // Multiple outgoing channels take precedence over a single channel
  const outgoing = !!channels.length ? channels : single;

  // Exit early when there is no outgoing channel constraint
  if (!outgoing.length) {
    return {};
  }

  try {
    return {ids: outgoing.map(n => chanNumber({channel: n}).number)};
  } catch (err) {
    throw new Error('ExpectedStandardFormatOutgoingChannelIds');
  }
};
