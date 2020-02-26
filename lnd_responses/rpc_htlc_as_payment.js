const isBoolean = n => n === false || n === true;

/** Interpret RPC HTLC message as payment

  {
    amount: <HTLC Tokens Amount String>
    expiration_height: <CLTV Timeout Block Height Number>
    hash_lock: <Payment Hash Buffer Object>
    incoming: <HTLC Is Locally Incoming Bool>
  }

  @throws
  <Error>

  @returns
  {
    id: <Payment Preimage Hash Hex String>
    is_outgoing: <Payment Is Outgoing Bool>
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

  return {
    id: args.hash_lock.toString('hex'),
    is_outgoing: !args.incoming,
    timeout: args.expiration_height,
    tokens: Number(args.amount),
  };
};
