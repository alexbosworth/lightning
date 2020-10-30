const {chanFormat} = require('bolt07');

const bufferAsHex = buffer => buffer.toString('hex');
const isBoolean = n => n === false || n === true;

/** Interpret RPC HTLC message as payment

  {
    amount: <HTLC Tokens Amount String>
    expiration_height: <CLTV Timeout Block Height Number>
    forwarding_channel: <Numeric Forward Paired Channel Id String>
    forwarding_htlc_index: <Forward Channel Pair HTLC Index String>
    hash_lock: <Payment Hash Buffer Object>
    htlc_index: <HTLC Index String>
    incoming: <HTLC Is Locally Incoming Bool>
  }

  @throws
  <Error>

  @returns
  {
    id: <Payment Preimage Hash Hex String>
    [in_channel]: <Forward Inbound From Channel Id String>
    [in_payment]: <Payment Index on Inbound Channel Number>
    [is_forward]: <Payment is a Forward Bool>
    is_outgoing: <Payment Is Outgoing Bool>
    [out_channel]: <Forward Outbound To Channel Id String>
    [out_payment]: <Payment Index on Outbound Channel Number>
    [payment]: <Payment Attempt Id Number>
    timeout: <Chain Height Expiration Number>
    tokens: <Payment Tokens Number>
  }
*/
module.exports = args => {
  if (!args) {
    throw new Error('ExpectedHtlcInHtlcMessage');
  }

  if (!args.amount) {
    throw new Error('ExpectedTokensAmountInHtlcMessage');
  }

  if (!args.expiration_height) {
    throw new Error('ExpectedExpirationHeightInHtlcMessage');
  }

  if (!Buffer.isBuffer(args.hash_lock)) {
    throw new Error('ExpectedPaymentHashInHtlcMessage');
  }

  if (!isBoolean(args.incoming)) {
    throw new Error('ExpectedBooleanIncomingStateInHtlcMessage');
  }

  const forward = args.forwarding_channel;
  const isForward = !!Number(args.forwarding_channel);
  const isOutgoing = !args.incoming;

  if (isForward) {
    try {
      chanFormat({number: forward});
    } catch (err) {
      throw new Error('ExpectedValidChannelIdForHtlcForwardPairChannel');
    }
  }

  const between = isForward ? chanFormat({number: forward}).channel : null;
  const betweenIndex = Number(args.forwarding_htlc_index);

  return {
    id: bufferAsHex(args.hash_lock),
    in_channel: !!isOutgoing && !!between ? between : undefined,
    in_payment: !!isOutgoing && !!betweenIndex ? betweenIndex : undefined,
    is_forward: isForward || undefined,
    is_outgoing: !args.incoming,
    out_channel: !isOutgoing && !!between ? between : undefined,
    out_payment: !isOutgoing && !!betweenIndex ? betweenIndex : undefined,
    payment: !!Number(args.htlc_index) ? Number(args.htlc_index) : undefined,
    timeout: args.expiration_height,
    tokens: Number(args.amount),
  };
};
