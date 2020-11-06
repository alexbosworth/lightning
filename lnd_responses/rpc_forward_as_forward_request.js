const BN = require('bn.js');
const {chanFormat} = require('bolt07');

const {safeTokens} = require('./../bolt00');

const bufferAsHex = buffer => buffer.toString('hex');
const {isBuffer} = Buffer;
const {keys} = Object;

const numberAsChannelId = number => chanFormat({number}).channel;

/** Map an RPC forward request to a forward request

  {
    custom_records: {
      <Record Number String>: <Record Data Buffer Object>
    }
    incoming_amount_msat: <HTLC Amount Millitokens String>
    incoming_circuit_key: {
      chan_id: <Numeric Channel Id String>
      htlc_id: <Channel HTLC Index Number String>
    }
    incoming_expiry: <HTLC CLTV Timeout Height Number>
    onion_blob: <Onion Blob Buffer Object>
    outgoing_amount_msat: <Outgoing Amount Millitokens String>
    outgoing_expiry: <HTLC CLTV Timeout Height Number>
    outgoing_requested_chan_id: <Outgoing Requested Channel Id String>
    payment_hash: <Preimage Hash Buffer Object>
  }

  @throws
  <Error>

  @returns
  {
    cltv_delta: <Difference Between Out and In CLTV Height Number>
    fee: <Routing Fee Tokens Rounded Down Number>
    fee_mtokens: <Routing Fee Millitokens String>
    hash: <Payment Hash Hex String>
    in_channel: <Inbound Standard Format Channel Id String>
    in_payment: <Inbound Channel Payment Id Number>
    messages: [{
      type: <Message Type Number String>
      value: <Raw Value Hex String>
    }]
    mtokens: <Millitokens to Forward To Next Peer String>
    [onion]: <Hex Serialized Next-Hop Onion Packet To Forward String>
    out_channel: <Requested Outbound Channel Standard Format Id String>
    timeout: <CLTV Timeout Height Number>
    tokens: <Tokens to Forward to Next Peer Rounded Down Number>
  }
*/
module.exports = forward => {
  if (!forward) {
    throw new Error('ExpectedRpcForwardRequestToMapToForwardRequest');
  }

  if (!forward.custom_records) {
    throw new Error('ExpectedCustomRecordsInRpcForwardRequest');
  }

  if (!forward.incoming_amount_msat) {
    throw new Error('ExpectedIncomingAmountMillitokensInRpcForwardRequest');
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

  if (!forward.incoming_expiry) {
    throw new Error('ExpectedCltvTimeoutHeightInRpcForwardRequest');
  }

  if (!forward.outgoing_amount_msat) {
    throw new Error('ExpectedOutgoingAmountMillitokensInRpcForwardRequest');
  }

  if (!forward.outgoing_expiry) {
    throw new Error('ExpectedOutgoingExpiryHeightInRpcForwardRequest');
  }

  if (forward.outgoing_expiry > forward.incoming_expiry) {
    throw new Error('ExpectedIncomingForwardExpiryHigherThanOutgoingExpiry');
  }

  if (!forward.outgoing_requested_chan_id) {
    throw new Error('ExpectedOutgoingRequestedChannelIdInRpcForwardRequest');
  }

  if (!isBuffer(forward.payment_hash)) {
    throw new Error('ExpectedPaymentHashBufferInRpcForwardRequest');
  }

  const incomingAmount = BigInt(forward.incoming_amount_msat);
  const outgoingAmount = BigInt(forward.outgoing_amount_msat);

  if (incomingAmount < outgoingAmount) {
    throw new Error('UnexpectedNegativeFeeInRpcForwardRequest');
  }

  const hasOnion = !!forward.onion_blob && !!forward.onion_blob.length;
  const totalFeeAmount = incomingAmount - outgoingAmount;

  return {
    cltv_delta: forward.incoming_expiry - forward.outgoing_expiry,
    fee: safeTokens({mtokens: totalFeeAmount.toString()}).tokens,
    fee_mtokens: totalFeeAmount.toString(),
    hash: bufferAsHex(forward.payment_hash),
    in_channel: numberAsChannelId(forward.incoming_circuit_key.chan_id),
    in_payment: Number(forward.incoming_circuit_key.htlc_id),
    messages: keys(forward.custom_records).map(type => {
      const rawType = Buffer.from(type, 'ascii').reverse();

      return {
        type: new BN(rawType).toString(),
        value: forward.custom_records[type].toString('hex'),
      };
    }),
    mtokens: forward.outgoing_amount_msat,
    onion: hasOnion ? forward.onion_blob.toString('hex') : undefined,
    out_channel: numberAsChannelId(forward.outgoing_requested_chan_id),
    timeout: forward.incoming_expiry,
    tokens: safeTokens({mtokens: forward.outgoing_amount_msat}).tokens,
  };
};
