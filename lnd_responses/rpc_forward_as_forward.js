const {chanFormat} = require('bolt07');

const asSeconds = (ns, s) => ns === '0' ? s : Number(BigInt(ns) / BigInt(1e9));
const msPerSec = 1e3;

/** RPC forward as forward

  {
    amt_in: <Inbound Amount Tokens String>
    amt_in_msat: <Inbound Amount Millitokens String>
    amt_out: <Outbound Amount Tokens String>
    amt_out_msat: <Outbound Amount Millitokens String>
    chan_id_in: <Incoming Numeric Format Channel Id String>
    chan_id_out: <Outgoing Numeric Format Channel Id String>
    fee: <Routing Fee Tokens String>
    fee_msat: <Routing Fee Millitokens String>
    timestamp: <Timestamp Epoch Time Seconds String>
    timestamp_ns: <Timestamp Epoch Time Nanoseconds String>
  }

  @throws
  <Error>

  @returns
  {
    created_at: <Forward Record Created At ISO 8601 Date String>
    fee: <Rounded Down Fee Tokens Charged Number>
    fee_mtokens: <Fee Millitokens Charged String>
    incoming_channel: <Incoming Standard Format Channel Id String>
    mtokens: <Forwarded Millitokens String>
    outgoing_channel: <Outgoing Standard Format Channel Id String>
    tokens: <Forwarded Tokens Number>
  }
*/
module.exports = forward => {
  if (!forward) {
    throw new Error('ExpectedRpcForwardToDeriveForward');
  }

  if (!forward.amt_in) {
    throw new Error('ExpectedIncomingForwardAmount');
  }

  if (!forward.amt_out) {
    throw new Error('ExpectedOutgoingForwardAmount');
  }

  if (!forward.chan_id_in) {
    throw new Error('ExpectedForwardChannelInId');
  }

  try {
    chanFormat({number: forward.chan_id_in}).channel;
  } catch (err) {
    throw new Error('ExpectedNumericIncomingChannelId');
  }

  if (!forward.chan_id_out) {
    throw new Error('ExpectedForwardChannelOutId');
  }

  try {
    chanFormat({number: forward.chan_id_out});
  } catch (err) {
    throw new Error('ExpectedNumericOutgoingChannelId');
  }

  if (!forward.fee) {
    throw new Error('ExpectedForwardFeeValue');
  }

  if (!forward.timestamp) {
    throw new Error('ExpectedTimestampForForwardEvent');
  }

  if (!forward.timestamp_ns) {
    throw new Error('ExpectedTimestampNanosecondsForForwardEvent');
  }

  // timestamp_ns is not supported in LND 0.12.1 and below, fall back to secs
  const epochSec = asSeconds(forward.timestamp_ns, forward.timestamp);

  return {
    created_at: new Date(epochSec * msPerSec).toISOString(),
    fee: Number(forward.fee),
    fee_mtokens: forward.fee_msat,
    incoming_channel: chanFormat({number: forward.chan_id_in}).channel,
    mtokens: forward.amt_out_msat,
    outgoing_channel: chanFormat({number: forward.chan_id_out}).channel,
    tokens: Number(forward.amt_out),
  };
};
