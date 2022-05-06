const bufferAsHex = buffer => buffer.toString('hex');
const {isBuffer} = Buffer;

/** Map RPC MuSig2 Session to a MuSig2 Session

  {
    combined_key: <Combined Public Key Buffer Object>
    local_public_nonces: <Two Concatenated Local Signer Nonces Buffer Object>
    session_id: <Session Id Buffer Object>
    taproot_internal_key: <Taproot Internal Public Key Buffer Object>
  }

  @throws
  <Error>

  @returns
  {
    external_key: <Final Script or Top Level Public Key Hex String>
    id: <Session Id Hex String>
    [internal_key]: <Internal Top Level Public Key Hex String>
    nonce: <Session Compound Nonces Hex String>
  }
*/
module.exports = args => {
  if (!args) {
    throw new Error('ExpectedResponseForMuSig2SessionRequest');
  }

  if (!isBuffer(args.combined_key)) {
    throw new Error('ExpectedCombinedPublicKeyInMuSig2SessionResponse');
  }

  if (!isBuffer(args.local_public_nonces)) {
    throw new Error('ExpectedLocalPublicNoncesInMuSig2SessionResponse');
  }

  if (!isBuffer(args.session_id)) {
    throw new Error('ExpectedMuSig2SigningSessionIdInSessionResponse');
  }

  if (!isBuffer(args.taproot_internal_key)) {
    throw new Error('ExpectedTaprootInternalKeyInMuSig2SessionResponse');
  }

  return {
    external_key: bufferAsHex(args.combined_key),
    id: bufferAsHex(args.session_id),
    internal_key: bufferAsHex(args.taproot_internal_key) || undefined,
    nonce: bufferAsHex(args.local_public_nonces),
  };
};
