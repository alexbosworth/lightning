const bufferAsHex = buffer => buffer.toString('hex');
const minConfs = (isZero, confs) => isZero ? Number() : (confs || undefined);

/** Derive open channel details from an open channel request gRPC message

  {
    base_fee: <Set Channel Base Fee Millitokens String>
    close_address: <Cooperative Close Address String>
    fee_rate: <Set Channel Routing Fee Rate Millitoken Per Millitokens String>
    fund_max: <Use Maximal Funding Bool>
    local_funding_amount: <Channel Capacity Tokens String>
    memo: <Channel Description String>
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
    use_base_fee: <Set Base Fee Bool>
    use_fee_rate: <Set Fee Rate Bool>
  }

  @returns
  {
    [base_fee_mtokens]: <Routing Base Fee Millitokens Charged String>
    [chain_fee_tokens_per_vbyte]: <Chain Fee Tokens Per VByte Number>
    [cooperative_close_address]: <Restrict Cooperative Close To Address String>
    [description]: <Channel Description String>
    [fee_rate]: <Routing Fee Rate In Millitokens Per Million Number>
    [give_tokens]: <Tokens to Gift To Partner Number>
    [is_max_funding]: <Use Maximal Chain Funds For Local Funding Bool>
    [is_private]: <Channel is Private Bool>
    [local_tokens]: <Local Tokens Number>
    [min_confirmations]: <Spend UTXOs With Minimum Confirmations Number>
    [min_htlc_mtokens]: <Minimum HTLC Millitokens String>
    partner_public_key: <Public Key Hex String>
    [partner_csv_delay]: <Peer Output CSV Delay Number>
  }
*/
module.exports = args => {
  const chainFeeRate = Number(args.sat_per_vbyte) || Number(args.sat_per_byte);
  const hasMinHtlc = args.min_htlc_msat !== Number().toString();
  const normalFunded = !args.fund_max;
  const publicKey = bufferAsHex(args.node_pubkey) || args.node_pubkey_string;
  const utxoConfs = minConfs(args.spend_unconfirmed, args.min_confirmations);

  return {
    base_fee_mtokens: !!args.use_fee_rate ? args.base_fee : undefined,
    chain_fee_tokens_per_vbyte: chainFeeRate || undefined,
    cooperative_close_address: args.close_address || undefined,
    description: args.memo || undefined,
    fee_rate: !!args.use_fee_rate ? Number(args.fee_rate) : undefined,
    give_tokens: Number(args.push_sat) || undefined,
    is_max_funding: !!args.fund_max || undefined,
    is_private: args.private || undefined,
    local_tokens: normalFunded ? Number(args.local_funding_amount) : undefined,
    min_confirmations: utxoConfs,
    min_htlc_mtokens: hasMinHtlc ? args.min_htlc_msat : undefined,
    partner_public_key: publicKey,
    partner_csv_delay: args.remote_csv_delay || undefined,
  };
};
