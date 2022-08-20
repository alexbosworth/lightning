const bufferAsHex = buffer => buffer.toString('hex');
const compressedPublicKeyLength = 33;
const hashAsId = hash => hash.reverse().toString('hex');
const {isBuffer} = Buffer;
const millitokensAsTokens = mtokens => Number(BigInt(mtokens) / BigInt(1e3));
const privateChannel = 1;
const weightPerKWeight = 1e3;
const weightPerVByte = 4;

/** Map an RPC channel accept request to an open request

  {
    chain_hash: <Blockchain Genesis Block Hash Bytes Buffer Object>
    channel_flags: <Bit-field Channel Type Flags Number>
    channel_reserve: <Reserve Tokens Requirement String>
    csv_delay: <Relative Time Lock Blocks Count Number>
    dust_limit: <Dust Limit Tokens of Peer's Commitment Transaction String>
    fee_per_kw: <Commitment Transaction Fee Rate String>
    funding_amt: <Channel Capacity Tokens String>
    max_accepted_htlcs: <Maximum Allowable Pending HTLCs Number>
    max_value_in_flight: <Maximum Millitokens Pending String>
    min_htlc: <Minimum HTLC Millitokens Size String>
    node_pubkey: <Peer Public Key Bytes Buffer Object>
    pending_chan_id: <Temporary Pending Id Bytes Buffer Object>
    push_amt: <Gifted Millitokens From Peer String>
    wants_zero_conf: <Request Is Trusted Funding Bool>
  }

  @throws
  <Error>

  @returns
  {
    capacity: <Capacity Tokens Number>
    chain: <Chain Id Hex String>
    commit_fee_tokens_per_vbyte: <Commitment Transaction Fee Number>
    csv_delay: <CSV Delay Blocks Number>
    id: <Request Id Hex String>
    is_private: <Incoming Channel Is Private Bool>
    is_trusted_funding: <Accept Funding as Trusted Bool>
    local_balance: <Channel Local Tokens Balance Number>
    local_reserve: <Channel Local Reserve Tokens Number>
    max_pending_mtokens: <Maximum Millitokens Pending In Channel String>
    max_pending_payments: <Maximum Pending Payments Number>
    min_chain_output: <Minimum Chain Output Tokens Number>
    min_htlc_mtokens: <Minimum HTLC Millitokens String>
    partner_public_key: <Peer Public Key Hex String>
  }
*/
module.exports = data => {
  if (!data) {
    throw new Error('ExpectedRequestDataForChannelRequest');
  }

  if (!isBuffer(data.chain_hash)) {
    throw new Error('ExpectedChainHashForChannelOpenRequest');
  }

  if (data.channel_flags === undefined) {
    throw new Error('ExpectedChannelFlagsForChannelRequest');
  }

  if (!data.channel_reserve) {
    throw new Error('ExpectedChannelReserveForChannelRequest');
  }

  if (data.csv_delay === undefined) {
    throw new Error('ExpectedCsvDelayInChannelOpenRequest');
  }

  if (!data.dust_limit) {
    throw new Error('ExpectedDustLimitInChannelOpenRequest');
  }

  if (!data.fee_per_kw) {
    throw new Error('ExpectedFeePerKwForChannelOpenRequest');
  }

  if (!data.funding_amt) {
    throw new Error('ExpectedFundingAmountForChannelRequest');
  }

  if (data.max_accepted_htlcs === undefined) {
    throw new Error('ExpectedMaxAcceptedHtlcsForChannelRequest');
  }

  if (!data.max_value_in_flight) {
    throw new Error('ExpectedMaxValueInFlightForChannelRequest');
  }

  if (!data.min_htlc) {
    throw new Error('ExpectedMinimumHtlcSizeForChannelRequest');
  }

  if (!isBuffer(data.node_pubkey)) {
    throw new Error('ExpectedNodePublicKeyInRequestData');
  }

  if (data.node_pubkey.length !== compressedPublicKeyLength) {
    throw new Error('UnexpectedPublicKeyLengthInChanRequest');
  }

  if (!isBuffer(data.pending_chan_id)) {
    throw new Error('ExpectedPendingChannelIdInRequestData');
  }

  if (!data.push_amt) {
    throw new Error('ExpectedChannelPushAmountInRequestData');
  }

  const feeTok = Number(data.fee_per_kw) * weightPerVByte / weightPerKWeight;

  return {
    capacity: Number(data.funding_amt),
    chain: hashAsId(data.chain_hash),
    commit_fee_tokens_per_vbyte: feeTok,
    csv_delay: data.csv_delay,
    id: bufferAsHex(data.pending_chan_id),
    is_private: !(data.channel_flags & privateChannel),
    is_trusted_funding: !!data.wants_zero_conf,
    local_balance: millitokensAsTokens(data.push_amt),
    local_reserve: Number(data.channel_reserve),
    max_pending_mtokens: data.max_value_in_flight,
    max_pending_payments: data.max_accepted_htlcs,
    min_chain_output: Number(data.dust_limit),
    min_htlc_mtokens: data.min_htlc,
    partner_public_key: bufferAsHex(data.node_pubkey),
  };
};
