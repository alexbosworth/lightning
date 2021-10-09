const hashAsTxId = hash => hash.slice().reverse().toString('hex');

/** Derive open channel details from an open channel request gRPC message

  {
    channel_point: {
      funding_txid_bytes: <Internal Byte Order Transaction Hash Buffer Object>
      output_index: <Transaction Output Index Number>
    }
    delivery_address: <Request Cooperative Close Address String>
    force: <Force Close Channel Bool>
    sat_per_byte: <Chain Fee Tokens Per Virtual Byte String>
    target_conf: <Target Confirm Within N Blocks Number>
  }

  @returns
  {
    [address]: <Request Sending Local Channel Funds To Address String>
    [is_force_close]: <Is Force Close Bool>
    [target_confirmations]: <Confirmation Target Number>
    [tokens_per_vbyte]: <Tokens Per Virtual Byte Number>
    transaction_id: <Transaction Id Hex String>
    transaction_vout: <Transaction Output Index Number>
  }
*/
module.exports = args => {
  return {
    address: args.delivery_address || undefined,
    is_force_close: args.force || undefined,
    target_confirmations: args.target_conf || undefined,
    tokens_per_vbyte: Number(args.sat_per_byte) || undefined,
    transaction_id: hashAsTxId(args.channel_point.funding_txid_bytes),
    transaction_vout: args.channel_point.output_index,
  };
};
