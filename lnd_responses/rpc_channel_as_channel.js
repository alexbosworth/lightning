const {chanFormat} = require('bolt07');

const rpcHtlcAsPayment = require('./rpc_htlc_as_payment');

const {isArray} = Array;
const msPerSec = 1e3;
const outpointDelimiter = ':';

/** Translate an RPC channel into a channel

  {
    active: <Channel Is Active Bool>
    capacity: <Capacity Tokens String>
    chan_id: <Numeric Format Channel String>
    channel_point: <Channel Funding Outpoint String>
    chan_status_flags: <Channel Status Flags String>
    close_address: <Pre-arranged Desired Future Close Address String>
    commit_fee: <Force Close Transaction Fee Tokens String>
    commit_weight: <Force Close Transaction Total Weight Units String>
    csv_delay: <Required Blocks Wait Time After Force Close Number>
    fee_per_kw: <Force Close Transaction Tokens Per 1k Weight String>
    initiator: <Is Channel Made By Local Node Bool>
    lifetime: <Channel Internal Monitoring For Seconds Number>
    local_balance: <Own Balance Tokens String>
    local_chan_reserve_sat: <Local Amount Reserve Minimum Limit Tokens String>
    num_updates: <Updated Channel Count String>
    pending_htlcs: [{
      amount: <HTLC Tokens Amount String>
      expiration_height: <CLTV Timeout Block Height Number>
      hash_lock: <Payment Hash Buffer Object>
      incoming: <HTLC Is Locally Incoming Bool>
    }]
    private: <Channel Is Not Globally Advertised Bool>
    remote_balance: <Peer Balance Tokens String>
    remote_chan_reserve_sat: <Peer Amount Reserve Minimum Limit Tokens String>
    remote_pubkey: <Peer Public Key Hex String>
    static_remote_key: <Channel Uses Seed Recoverable Key Type Bool>
    total_satoshis_received: <Total Tokens Transferred Inbound String>
    total_satoshis_sent: <Total Tokens Transferred Outbound String>
    unsettled_balance: <Balance In Transaction Tokens String>
    uptime: <Channel Internal Monitoring Channel Active Seconds Number>
  }

  @throws
  <Error>

  @returns
  {
    capacity: <Channel Token Capacity Number>
    commit_transaction_fee: <Commit Transaction Fee Number>
    commit_transaction_weight: <Commit Transaction Weight Number>
    [cooperative_close_address]: <Coop Close Restricted to Address String>
    id: <Standard Format Channel Id String>
    is_active: <Channel Active Bool>
    is_closing: <Channel Is Closing Bool>
    is_opening: <Channel Is Opening Bool>
    is_partner_initiated: <Channel Partner Opened Channel Bool>
    is_private: <Channel Is Private Bool>
    [is_static_remote_key]: <Remote Key Is Static Bool>
    local_balance: <Local Balance Tokens Number>
    local_reserve: <Local Reserved Tokens Number>
    partner_public_key: <Channel Partner Public Key String>
    pending_payments: [{
      id: <Payment Preimage Hash Hex String>
      is_outgoing: <Payment Is Outgoing Bool>
      timeout: <Chain Height Expiration Number>
      tokens: <Payment Tokens Number>
    }]
    received: <Received Tokens Number>
    remote_balance: <Remote Balance Tokens Number>
    remote_reserve: <Remote Reserved Tokens Number>
    sent: <Sent Tokens Number>
    [time_offline]: <Monitoring Uptime Channel Down Milliseconds Number>
    [time_online]: <Monitoring Uptime Channel Up Milliseconds Number>
    transaction_id: <Blockchain Transaction Id String>
    transaction_vout: <Blockchain Transaction Vout Number>
    unsettled_balance: <Unsettled Balance Tokens Number>
  }
*/
module.exports = args => {
  if (args.active === undefined) {
    throw new Error('ExpectedChannelActiveStateInChannelMessage');
  }

  if (args.capacity === undefined) {
    throw new Error('ExpectedChannelCapacityInChannelMessage');
  }

  if (!args.chan_id) {
    throw new Error('ExpectedChannelIdNumberInChannelsList');
  }

  if (!args.channel_point) {
    throw new Error('ExpectedChannelPointInChannelMessage');
  }

  if (args.commit_fee === undefined) {
    throw new Error('ExpectedCommitFeeInChannelMessage');
  }

  if (args.commit_weight === undefined) {
    throw new Error('ExpectedCommitWeightInChannelMessage');
  }

  if (args.fee_per_kw === undefined) {
    throw new Error('ExpectedFeePerKwInChannelMessage');
  }

  if (args.local_balance === undefined) {
    throw new Error('ExpectedLocalBalanceInChannelMessage');
  }

  if (!args.local_chan_reserve_sat) {
    throw new Error('ExpectedLocalChannelReserveAmountInChannelMessage');
  }

  if (args.num_updates === undefined) {
    throw new Error('ExpectedNumUpdatesInChannelMessage');
  }

  if (!isArray(args.pending_htlcs)) {
    throw new Error('ExpectedChannelPendingHtlcsInChannelMessage');
  }

  if (args.private !== true && args.private !== false) {
    throw new Error('ExpectedChannelPrivateStatusInChannelMessage');
  }

  if (args.remote_balance === undefined) {
    throw new Error('ExpectedRemoteBalanceInChannelMessage');
  }

  if (!args.remote_chan_reserve_sat) {
    throw new Error('ExpectedRemoteChannelReserveAmountInChannelMessage');
  }

  if (!args.remote_pubkey) {
    throw new Error('ExpectedRemotePubkeyInChannelMessage');
  }

  if (args.total_satoshis_received === undefined) {
    throw new Error('ExpectedTotalSatoshisReceivedInChannelMessage');
  }

  if (args.total_satoshis_sent === undefined) {
    throw new Error('ExpectedTotalSatoshisSentInChannelMessage');
  }

  if (args.unsettled_balance === undefined) {
    throw new Error('ExpectedUnsettledBalanceInChannelMessage');
  }

  const commitWeight = Number(args.commit_weight);
  const localReserveTokens = Number(args.local_chan_reserve_sat);
  const remoteReserveTokens = Number(args.remote_chan_reserve_sat);
  const [transactionId, vout] = args.channel_point.split(outpointDelimiter);
  const uptime = Number(args.uptime) * msPerSec;

  const downtime = Number(args.lifetime) * msPerSec - uptime;

  return {
    capacity: Number(args.capacity),
    commit_transaction_fee: Number(args.commit_fee),
    commit_transaction_weight: commitWeight,
    cooperative_close_address: args.close_address || undefined,
    id: chanFormat({number: args.chan_id}).channel,
    is_active: args.active,
    is_closing: false,
    is_opening: false,
    is_partner_initiated: !args.initiator,
    is_private: args.private,
    is_static_remote_key: args.static_remote_key || undefined,
    local_balance: Number(args.local_balance),
    local_reserve: localReserveTokens || undefined,
    partner_public_key: args.remote_pubkey,
    pending_payments: args.pending_htlcs.map(rpcHtlcAsPayment),
    received: Number(args.total_satoshis_received),
    remote_balance: Number(args.remote_balance),
    remote_reserve: remoteReserveTokens || undefined,
    sent: Number(args.total_satoshis_sent),
    time_offline: downtime || undefined,
    time_online: uptime || undefined,
    transaction_id: transactionId,
    transaction_vout: Number(vout),
    unsettled_balance: Number(args.unsettled_balance),
  };
};
