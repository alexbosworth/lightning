const {chanFormat} = require('bolt07');

const bufferAsHex = buffer => buffer.toString('hex');
const emptyTxId = Buffer.alloc(32);
const {isBuffer} = Buffer;
const now = () => new Date().toISOString();

/** Derive channel update details from an rpc channel update

  {
    advertising_node: <Advertising Node Public Key Hex String>
    capacity: <Channel Capacity Tokens String>
    chan_id: <Numeric Format Channel Id String>
    chan_point: {
      funding_txid_bytes: <Funding Internal Byte Order Tx Id Buffer Object>
      output_index: <Output Index Number>
    }
    connecting_node: <Connecting Node Public Key Hex String>
    routing_policy: {
      disabled: <Forwarding is Disabled Bool>
      fee_base_msat: <Forwarding Base Fee Millitokens String>
      fee_rate_milli_msat: <Forwarding Fee Rate Per Million String>
      max_htlc_msat: <Maximum HTLC Size Millitokens String>
      min_htlc: <Minimum HTLC Size Millitokens String>
      time_lock_delta: <Forwarding CLTV Delta Number>
    }
  }

  @throws
  <Error>

  @returns
  {
    base_fee_mtokens: <Channel Base Fee Millitokens String>
    [capacity]: <Channel Capacity Tokens Number>
    cltv_delta: <Channel CLTV Delta Number>
    fee_rate: <Channel Fee Rate In Millitokens Per Million Number>
    id: <Standard Format Channel Id String>
    is_disabled: <Channel Is Disabled Bool>
    [max_htlc_mtokens]: <Channel Maximum HTLC Millitokens String>
    min_htlc_mtokens: <Channel Minimum HTLC Millitokens String>
    public_keys: [<Announcing Public Key>, <Target Public Key String>]
    [transaction_id]: <Channel Transaction Id String>
    [transaction_vout]: <Channel Transaction Output Index Number>
    updated_at: <Update Received At ISO 8601 Date String>
  }
*/
module.exports = update => {
  if (!update) {
    throw new Error('ExpectedChannelUpdateDetails');
  }

  if (!update.advertising_node) {
    throw new Error('ExpectedAnnouncingKey');
  }

  if (!update.capacity) {
    throw new Error('ExpectedChanCapacity');
  }

  if (!update.chan_id) {
    throw new Error('ExpectedChannelId');
  }

  if (!update.chan_point) {
    throw new Error('ExpectedChanPoint');
  }

  if (!isBuffer(update.chan_point.funding_txid_bytes)) {
    throw new Error('ExpectedChanPointTxId');
  }

  if (update.chan_point.output_index === undefined) {
    throw new Error('ExpectedChanPointVout');
  }

  if (!update.connecting_node) {
    throw new Error('ExpectedConnectingNode');
  }

  if (!update.routing_policy) {
    throw new Error('ExpectedRoutingPolicy');
  }

  if (update.routing_policy.disabled === undefined) {
    throw new Error('ExpectedDisabledStatus');
  }

  if (!update.routing_policy.fee_base_msat) {
    throw new Error('ExpectedFeeBaseMsat');
  }

  if (!update.routing_policy.fee_rate_milli_msat) {
    throw new Error('ExpectedFeeRate');
  }

  if (!update.routing_policy.max_htlc_msat) {
    throw new Error('ExpectedMaxHtlcInChannelUpdate');
  }

  if (!update.routing_policy.min_htlc) {
    throw new Error('ExpectedMinHtlc');
  }

  if (update.routing_policy.time_lock_delta === undefined) {
    throw new Error('ExpectedCltvDelta');
  }

  try {
    chanFormat({number: update.chan_id});
  } catch (err) {
    throw new Error('ExpectedValidChannelId');
  }

  const maxHtlc = update.routing_policy.max_htlc_msat;
  const transactionId = update.chan_point.funding_txid_bytes.reverse();

  const txId = !!transactionId.equals(emptyTxId) ? null : transactionId;

  return {
    base_fee_mtokens: update.routing_policy.fee_base_msat,
    capacity: Number(update.capacity) || undefined,
    cltv_delta: update.routing_policy.time_lock_delta,
    fee_rate: Number(update.routing_policy.fee_rate_milli_msat),
    id: chanFormat({number: update.chan_id}).channel,
    is_disabled: update.routing_policy.disabled,
    max_htlc_mtokens: maxHtlc !== Number().toString() ? maxHtlc : undefined,
    min_htlc_mtokens: update.routing_policy.min_htlc,
    public_keys: [update.advertising_node, update.connecting_node],
    transaction_id: !!txId ? bufferAsHex(txId) : undefined,
    transaction_vout: !!txId ? update.chan_point.output_index : undefined,
    updated_at: now(),
  };
};
