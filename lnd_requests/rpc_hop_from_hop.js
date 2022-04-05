const {chanNumber} = require('bolt07');

const hexAsBuffer = hex => Buffer.from(hex, 'hex');
const isNumber = n => !isNaN(n);
const millitokensAsTokens = n => Number(BigInt(n) / BigInt(1e3));

/** Get a hop formatted as a RPC hop

  {
    channel: <Standard Format Channel Id String>
    channel_capacity: <Channel Capacity Tokens Number>
    fee: <Fee Number>
    fee_mtokens: <Fee Millitokens String>
    forward: <Forward Tokens Number>
    forward_mtokens: <Forward Millitokens String>
    [messages]: [{
      type: <Message Type Number String>
      value: <Message Raw Value Hex Encoded String>
    }]
    [public_key]: <Forward Edge Public Key Hex String>
    timeout: <Timeout Block Height Number>
  }

  @throws
  <Error>

  @returns
  {
    amt_to_forward: <Tokens to Forward String>
    amt_to_forward_msat: <Millitokens to Forward String>
    chan_id: <Numeric Format Channel Id String>
    chan_capacity: <Channel Capacity Number>
    [custom_records]: {<TLV Type Number String>: <TLV Value Buffer Object>}
    expiry: <Timeout Chain Height Number>
    fee: <Fee in Tokens Number>
    fee_msat: <Fee in Millitokens String>
    [pub_key]: <Next Hop Public Key Hex String>
    [tlv_payload]: <Has Extra TLV Data Bool>
  }
*/
module.exports = args => {
  if (!isNumber(args.channel_capacity)) {
    throw new Error('ExpectedNumericChannelCapacityToMapRpcHopFromHop');
  }

  if (!args.forward_mtokens) {
    throw new Error('ExpectedForwardMillitokensToMapRpcHopFromHop');
  }

  if (!args.fee_mtokens) {
    throw new Error('ExpectedFeeMillitokensToMapRpcHopFromHop');
  }

  const hop = {
    amt_to_forward: millitokensAsTokens(args.forward_mtokens).toString(),
    amt_to_forward_msat: args.forward_mtokens,
    chan_id: chanNumber({channel: args.channel}).number,
    chan_capacity: args.channel_capacity.toString(),
    expiry: args.timeout,
    fee: millitokensAsTokens(args.fee_mtokens).toString(),
    fee_msat: args.fee_mtokens,
    pub_key: args.public_key,
    tlv_payload: true,
  };

  // Exit early when there are no messages to encode in this hop
  if (!args.messages || !args.messages.length) {
    return hop;
  }

  hop.custom_records = args.messages.reduce((tlv, n) => {
    tlv[n.type] = hexAsBuffer(n.value);

    return tlv;
  },
  {});

  return hop;
};
