const {chanFormat} = require('bolt07');

const {safeTokens} = require('./../bolt00');

const bufferAsHex = buffer => buffer.toString('hex');
const {isBuffer} = Buffer;

/** Map an RPC forward request to a forward request

  {
    amount_msat: <HTLC Amount Millitokens String>
    expiry: <HTLC CLTV Timeout Height Number>
    htlc_payment_hash: <Preimage Hash Buffer Object>
    incoming_circuit_key: {
      chan_id: <Numeric Channel Id String>
      htlc_id: <Channel HTLC Index Number String>
    }
  }

  @throws
  <Error>

  @returns
  {
    hash: <Payment Hash Hex String>
    in_channel: <Inbound Standard Format Channel Id String>
    in_payment: <Inbound Channel Payment Id Number>
    mtokens: <Millitokens to Forward String>
    timeout: <CLTV Timeout Height Number>
    tokens: <Tokens to Forward Rounded Down Number>
  }
*/
module.exports = forward => {
  if (!forward) {
    throw new Error('ExpectedRpcForwardRequestToMapToForwardRequest');
  }

  if (!forward.amount_msat) {
    throw new Error('ExpectedAmountMillitokensInRpcForwardRequest');
  }

  if (!forward.expiry) {
    throw new Error('ExpectedCltvTimeoutHeightInRpcForwardRequest');
  }

  if (!isBuffer(forward.htlc_payment_hash)) {
    throw new Error('ExpectedPaymentHashBufferInRpcForwardRequest');
  }

  if (!forward.incoming_circuit_key) {
    throw new Error('ExpectedInboundChannelDetailsInRpcForwardRequest')
  }

  if (!forward.incoming_circuit_key.chan_id) {
    throw new Error('ExpectedInboundChannelIdInRpcForwardRequest');
  }

  if (forward.incoming_circuit_key.htlc_id === undefined) {
    throw new Error('ExpectedInboundChannelHtlcIndexInRpcForwardRequest');
  }

  const number = forward.incoming_circuit_key.chan_id;

  return {
    hash: bufferAsHex(forward.htlc_payment_hash),
    in_channel: chanFormat({number}).channel,
    in_payment: Number(forward.incoming_circuit_key.htlc_id),
    mtokens: forward.amount_msat,
    timeout: forward.expiry,
    tokens: safeTokens({mtokens: forward.amount_msat}).tokens,
  };
};
