const bufferAsHex = buffer => buffer.toString('hex');
const minConfs = (isZero, confs) => isZero ? Number() : (confs || undefined);

/** Derive open channel details from an open channel request gRPC message

  {
    close_address: <Cooperative Close Address String>
    local_funding_amount: <Channel Capacity Tokens String>
    min_htlc_msat: <Minimum HTLC Millitokens String>
    node_pubkey: <Node Public Key Buffer Object>
    node_pubkey_string: <Node Public Key Hex String>
    private: <Channel Is Private Bool>
    push_sat: <Gift Tokens String>
    remote_csv_delay: <Peer Uncooperative Output CSV Delay Blocks Number>
    sat_per_byte: <Tokens Per Virtual Byte String>
    sat_per_vbyte: <Tokens Per Virtual Byte String>
    spend_unconfirmed: <Spend Unconfirmed UTXOs Bool>
    target_conf: <Funding Transaction Confirmation Target Number>
  }

  @returns
  {
    [chain_fee_tokens_per_vbyte]: <Chain Fee Tokens Per VByte Number>
    [cooperative_close_address]: <Restrict Cooperative Close To Address String>
    [give_tokens]: <Tokens to Gift To Partner Number>
    [is_private]: <Channel is Private Bool>
    local_tokens: <Local Tokens Number>
    [min_confirmations]: <Spend UTXOs With Minimum Confirmations Number>
    [min_htlc_mtokens]: <Minimum HTLC Millitokens String>
    partner_public_key: <Public Key Hex String>
    [partner_csv_delay]: <Peer Output CSV Delay Number>
  }
*/
module.exports = args => {
  const feeRate = Number(args.sat_per_vbyte) || Number(args.sat_per_byte);
  const hasMinHtlc = args.min_htlc_msat !== Number().toString();
  const publicKey = bufferAsHex(args.node_pubkey) || args.node_pubkey_string;
  const utxoConfs = minConfs(args.spend_unconfirmed, args.min_confirmations);

  return {
    chain_fee_tokens_per_vbyte: feeRate || undefined,
    cooperative_close_address: args.close_address || undefined,
    give_tokens: Number(args.push_sat) || undefined,
    is_private: args.private || undefined,
    local_tokens: Number(args.local_funding_amount),
    min_confirmations: utxoConfs,
    min_htlc_mtokens: hasMinHtlc ? args.min_htlc_msat : undefined,
    partner_public_key: publicKey,
    partner_csv_delay: args.remote_csv_delay || undefined,
  };
};
