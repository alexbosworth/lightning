const {chanNumber} = require('bolt07');

const hexAsBuffer = hex => Buffer.from(hex, 'hex');
const millitokensAsTokens = n => Number(BigInt(n) / BigInt(1e3));

/** Get a hop formatted as a RPC hop

  Blinded path hops have `encrypted_data` and the introduction node hop has
  the `path_key`

  {
    channel: <Standard Format Channel Id String>
    [encrypted_data]: <Blinded Path Encrypted Data Hex String>
    fee: <Fee Number>
    fee_mtokens: <Fee Millitokens String>
    forward: <Forward Tokens Number>
    forward_mtokens: <Forward Millitokens String>
    [messages]: [{
      type: <Message Type Number String>
      value: <Message Raw Value Hex Encoded String>
    }]
    [path_key]: <Blinded Path Key Hex String>
    [public_key]: <Forward Edge Public Key Hex String>
    timeout: <Timeout Block Height Number>
  }

  @throws
  <Error>

  @returns
  {
    amt_to_forward: <Tokens to Forward String>
    amt_to_forward_msat: <Millitokens to Forward String>
    [blinding_point]: <Blinded Path Key Buffer Object>
    chan_id: <Numeric Format Channel Id String>
    [custom_records]: {<TLV Type Number String>: <TLV Value Buffer Object>}
    [encrypted_data]: <Blinded Path Encrypted Data Buffer Object>
    expiry: <Timeout Chain Height Number>
    fee: <Fee in Tokens Number>
    fee_msat: <Fee in Millitokens String>
    [pub_key]: <Next Hop Public Key Hex String>
    [tlv_payload]: <Has Extra TLV Data Bool>
  }
*/
module.exports = args => {
  if (!args.forward_mtokens) {
    throw new Error('ExpectedForwardMillitokensToMapRpcHopFromHop');
  }

  if (!args.fee_mtokens) {
    throw new Error('ExpectedFeeMillitokensToMapRpcHopFromHop');
  }

  if (!!args.path_key && !args.encrypted_data) {
    throw new Error('ExpectedEncryptedDataForBlindedPathKeyInRpcHop');
  }

  const hop = {
    amt_to_forward: millitokensAsTokens(args.forward_mtokens).toString(),
    amt_to_forward_msat: args.forward_mtokens,
    chan_id: chanNumber({channel: args.channel}).number,
    expiry: args.timeout,
    fee: millitokensAsTokens(args.fee_mtokens).toString(),
    fee_msat: args.fee_mtokens,
    pub_key: args.public_key,
    tlv_payload: true,
  };

  // Hops in a blinded path get their forwarding details from encrypted data
  if (!!args.encrypted_data) {
    hop.encrypted_data = hexAsBuffer(args.encrypted_data);
  }

  // The introduction node of a blinded path is given the path key
  if (!!args.path_key) {
    hop.blinding_point = hexAsBuffer(args.path_key);
  }

  // Exit early when there are no messages to encode in this hop
  if (!args.messages || !args.messages.length) {
    return hop;
  }

  // Blinded path hops only accept the encrypted data in their payload
  if (!!args.encrypted_data) {
    throw new Error('ExpectedNoMessagesForBlindedPathHop');
  }

  hop.custom_records = args.messages.reduce((tlv, n) => {
    tlv[n.type] = hexAsBuffer(n.value);

    return tlv;
  },
  {});

  return hop;
};
