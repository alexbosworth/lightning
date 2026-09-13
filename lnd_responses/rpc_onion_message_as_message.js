const {chanFormat} = require('bolt07');

const asChannel = n => chanFormat({id: n.subarray(1).toString('hex')}).channel;
const asEdge = n => `${asChannel(n)}x${n[0]}`;
const asTypeNumber = n => BigInt(`0x${n.toString('hex') || '00'}`).toString();
const bufferAsHex = buffer => buffer.toString('hex');
const {isArray} = Array;
const {isBuffer} = Buffer;
const isEdge = n => n.length === 9 && [0, 1].includes(n[0]);
const isIntroduction = n => isEdge(n) || isNodeKey(n);
const isNodeKey = n => n.length === 33 && [2, 3].includes(n[0]);
const keyAsType = key => asTypeNumber(Buffer.from(key, 'ascii').reverse());
const {keys} = Object;

/** Map an RPC onion message to message details

  {
    custom_records: {
      <UInt64 Map Key String>: <Record Data Buffer>
    }
    encrypted_recipient_data: <Encrypted Data Buffer Object>
    onion: <Raw Onion Packet Buffer Object>
    path_key: <Path Key Buffer Object>
    peer: <Peer Identity Public Key Buffer Object>
    [reply_path]: {
      blinded_hops: [{
        blinded_node: <Blinded Relay Node Id Buffer Object>
        encrypted_data: <Encrypted Data Buffer Object>
      }]
      blinding_point: <Blinding Point Buffer Object>
      introduction_node: <Node Public Key or Edge Reference Buffer Object>
    }
  }

  @throws
  <Error>

  @returns
  {
    encrypted: <Encrypted Data Hex String>
    key: <Path Key Hex String>
    [message]: {
      type: <Message Payload Record Type Number String>
      value: <Message Payload Hex String>
    }
    onion: <Onion Packet Hex String>
    [reply]: {
      inbound: [{
        encrypted_data: <Encrypted Data Hex String>
        relay_key: <Relay Key Hex String>
      }]
      [introduction_edge]: <Introduction Node Edge Format Channel Id String>
      [introduction_node]: <Introduction Node Public Key Hex String>
      key: <Path Key Hex String>
    }
    via: <Message Received Via Peer with Identity Public Key Hex String>
  }
*/
module.exports = args => {
  if (!args) {
    throw new Error('ExpectedRpcMessageToDeriveOnionMessage');
  }

  if (!args.custom_records || typeof args.custom_records !== 'object') {
    throw new Error('ExpectedCustomRecordsToDeriveOnionMessage');
  }

  if (isArray(args.custom_records) || isBuffer(args.custom_records)) {
    throw new Error('ExpectedCustomRecordsToDeriveOnionMessage');
  }

  if (!keys(args.custom_records).every(n => isBuffer(args.custom_records[n]))) {
    throw new Error('ExpectedCustomRecordValueBufferToDeriveOnionMessage');
  }

  // A message carries at most one payload record, keyed by its uint64 type
  const [payloadType, ...otherPayloads] = keys(args.custom_records);

  if (!!otherPayloads.length) {
    throw new Error('ExpectedSinglePayloadRecordToDeriveOnionMessage');
  }

  if (!isBuffer(args.encrypted_recipient_data)) {
    throw new Error('ExpectedEncryptedRecipientDataToDeriveOnionMessage');
  }

  if (!isBuffer(args.onion)) {
    throw new Error('ExpectedOnionPacketToDeriveOnionMessage');
  }

  if (!isBuffer(args.path_key)) {
    throw new Error('ExpectedPathKeyToDeriveOnionMessage');
  }

  if (!isBuffer(args.peer)) {
    throw new Error('ExpectedPeerPublicKeyBytesToDeriveOnionMessage');
  }

  const path = args.reply_path;

  if (!!path && !isArray(path.blinded_hops)) {
    throw new Error('ExpectedReplyBlindedHopsArrayToDeriveOnionMessage');
  }

  // When the reply blinded hops are empty it signals no reply path
  const reply = !path || !path.blinded_hops.length ? undefined : path;

  if (!!reply) {
    if (!isBuffer(reply.blinding_point)) {
      throw new Error('ExpectedReplyBlindingPointToDeriveOnionMessage');
    }

    if (!isBuffer(reply.introduction_node)) {
      throw new Error('ExpectedReplyIntroductionNodeToDeriveOnionMessage');
    }

    if (!isIntroduction(reply.introduction_node)) {
      throw new Error('ExpectedReplyIntroductionKeyOrEdgeToDeriveOnionMessage');
    }

    if (!reply.blinded_hops.every(n => !!n && isBuffer(n.blinded_node))) {
      throw new Error('ExpectedReplyBlindedNodeToDeriveOnionMessage');
    }

    if (!reply.blinded_hops.every(n => isBuffer(n.encrypted_data))) {
      throw new Error('ExpectedReplyEncryptedDataToDeriveOnionMessage');
    }
  }

  // An introduction is a node public key or an edge to the node: a channel id
  // with the direction, 0 for the lesser channel node key, 1 for the greater
  const intro = !reply ? undefined : reply.introduction_node;

  return {
    encrypted: bufferAsHex(args.encrypted_recipient_data),
    key: bufferAsHex(args.path_key),
    // RPC uint64 map keys contain eight little-endian bytes
    message: payloadType === undefined ? undefined : {
      type: keyAsType(payloadType),
      value: bufferAsHex(args.custom_records[payloadType]),
    },
    onion: bufferAsHex(args.onion),
    reply: !reply ? undefined : {
      inbound: reply.blinded_hops.map(hop => ({
        encrypted_data: bufferAsHex(hop.encrypted_data),
        relay_key: bufferAsHex(hop.blinded_node),
      })),
      introduction_edge: !isEdge(intro) ? undefined : asEdge(intro),
      introduction_node: !isNodeKey(intro) ? undefined : bufferAsHex(intro),
      key: bufferAsHex(reply.blinding_point),
    },
    via: bufferAsHex(args.peer),
  };
};
