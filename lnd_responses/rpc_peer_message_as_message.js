const bufferAsHex = buffer => buffer.toString('hex');
const {isBuffer} = Buffer;

/** Map an RPC peer message to message details

  {
    data: <Message Data Buffer Object>
    peer: <Peer Public Key Buffer Object>
    type: <Message Type Number>
  }

  @throws
  <Error>

  @returns
  {
    message: <Message Data Hex String>
    public_key: <Peer Public Key Hex String>
    type: <Message Type Number>
  }
*/
module.exports = args => {
  if (!args) {
    throw new Error('ExpectedRpcMessageToDerivePeerMessage');
  }

  if (!isBuffer(args.data)) {
    throw new Error('ExpectedPeerMessageDataToDerivePeerMessage');
  }

  if (!isBuffer(args.peer)) {
    throw new Error('ExpectedPeerPublicKeyBytesToDerivePeerMessage');
  }

  if (!args.type) {
    throw new Error('ExpectedCustomMessageTypeNumberToDeriveMessage');
  }

  return {
    message: bufferAsHex(args.data),
    public_key: bufferAsHex(args.peer),
    type: args.type,
  };
};