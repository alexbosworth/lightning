const {chanFormat} = require('bolt07');

const {htlcTypes} = require('./constants');
const {safeTokens} = require('./../bolt00');

const bufferAsHex = buffer => buffer.toString('hex');
const nsPerMs = BigInt(1e6);

/** Get RPC HTLC Event as a forward event

  {
    event_type: <Event Type String>
    [forward_event]: {
      info: {
        incoming_amt_msat: <Incoming Channel HTLC Millitokens String>
        incoming_timelock: <Incoming Channel CLTV Block Height Number>
        outgoing_amt_msat: <Outgoing Channel HTLC Millitokens String>
        outgoing_timelock: <Outgoing Channel CLTV Block Height Number>
      }
    }
    [forward_fail_event]: <Forward Failure Event Object>
    incoming_channel_id: <Inbound Channel Numeric Id String>
    incoming_htlc_id: <Inbound Channel Historic Index Number>
    [link_fail_event]: {
      failure_detail: <Failure Code String>
      failure_string: <Failure Description String>
      info: {
        incoming_amt_msat: <Incoming Channel HTLC Millitokens String>
        incoming_timelock: <Incoming Channel CLTV Block Height Number>
        outgoing_amt_msat: <Outgoing Channel HTLC Millitokens String>
        outgoing_timelock: <Outgoing Channel CLTV Block Height Number>
      }
      wire_failure: <Wire Code String>
    }
    outgoing_channel_id: <Outbound Channel Numeric Id String>
    outgoing_htlc_id: <Outbound Channel Historic Index Number>
    [settle_event]: {
      preimage: <HTLC Preimage Buffer Object>
    }
    timestamp_ns: <Timestamp Nanoseconds String>
  }

  @throws
  <Error>

  @returns
  {
    at: <Forward Update At ISO 8601 Date String>
    [cltv_delta]: <CLTV Delta Number>
    [external_failure]: <Public Failure Reason String>
    [fee]: <Fee Tokens Charged Number>
    [fee_mtokens]: <Fee Millitokens Charged String>
    [in_channel]: <Inbound Standard Format Channel Id String>
    [in_payment]: <Inbound Channel Payment Id Number>
    [internal_failure]: <Private Failure Reason String>
    is_confirmed: <Forward Is Confirmed Bool>
    is_failed: <Forward Is Failed Bool>
    is_receive: <Is Receive Bool>
    is_send: <Is Send Bool>
    [mtokens]: <Sending Millitokens String>
    [out_channel]: <Outgoing Standard Format Channel Id String>
    [out_payment]: <Outgoing Channel Payment Id Number>
    [secret]: <Settled Preimage Hex String>
    [timeout]: <Forward Timeout at Height Number>
    [tokens]: <Sending Tokens Number>
  }
*/
module.exports = htlc => {
  if (!htlc.event_type) {
    throw new Error('ExpectedHtlcEventTypeToDeriveForwardFromHtlcEvent');
  }

  if (!!htlc.forward_event) {
    if (!htlc.forward_event.info) {
      throw new Error('ExpectedHtlcInfoInForwardEvent');
    }

    if (!htlc.forward_event.info.incoming_amt_msat) {
      throw new Error('ExpectedForwardEventIncomingAmountMsatToDeriveForward');
    }

    if (htlc.forward_event.info.incoming_timelock === undefined) {
      throw new Error('ExpectedForwardEventIncomingTimelockToDeriveForward');
    }

    if (!htlc.forward_event.info.outgoing_amt_msat) {
      throw new Error('ExpectedForwardEventOutgoingAmountMsatToDeriveForward');
    }

    if (htlc.forward_event.info.outgoing_timelock === undefined) {
      throw new Error('ExpectedForwardEventOutgoingTimelockToDeriveForward');
    }
  }

  if (!htlc.incoming_channel_id) {
    throw new Error('ExpectedIncomingChannelIdToDeriveForward');
  }

  if (!htlc.incoming_htlc_id) {
    throw new Error('ExpectedIncomingHtlcIdToDeriveForward');
  }

  if (!!htlc.link_fail_event) {
    if (!htlc.link_fail_event.failure_detail) {
      throw new Error('ExpectedLinkFailureDetailInLinkFailureEvent');
    }

    if (!htlc.link_fail_event.failure_string) {
      throw new Error('ExpectedLinkFailureStringInLinkFailureEvent');
    }

    if (!htlc.link_fail_event.info) {
      throw new Error('ExpectedHtlcInfoInLinkFailEvent');
    }

    if (!htlc.link_fail_event.info.incoming_amt_msat) {
      throw new Error('ExpectedLinkFailEventIncomingMsatToDeriveForward');
    }

    if (htlc.link_fail_event.info.incoming_timelock === undefined) {
      throw new Error('ExpectedLinkFailEventIncomingTimelockToDeriveForward');
    }

    if (!htlc.link_fail_event.info.outgoing_amt_msat) {
      throw new Error('ExpectedLinkFailEventOutgoingMsatToDeriveForward');
    }

    if (htlc.link_fail_event.info.outgoing_timelock === undefined) {
      throw new Error('ExpectedForwardEventOutgoingTimelockToDeriveForward');
    }
  }

  if (!htlc.outgoing_channel_id) {
    throw new Error('ExpectedOutgoingChannelIdToDeriveForward');
  }

  if (!htlc.outgoing_htlc_id) {
    throw new Error('ExpectedOutgoingHtlcIdToDeriveForward');
  }

  if (!!htlc.settle_event && !Buffer.isBuffer(htlc.settle_event.preimage)) {
    throw new Error('ExpectedHtlcPreimageInForwardedSettleEvent');
  }

  if (!htlc.timestamp_ns) {
    throw new Error('ExpectedHtlcTimestampToDeriveForward');
  }

  const createdAt = new Date(Number(BigInt(htlc.timestamp_ns) / nsPerMs));
  const incoming = chanFormat({number: htlc.incoming_channel_id});
  const incomingId = Number(htlc.incoming_htlc_id);
  const isFailure = !!htlc.forward_fail_event || !!htlc.link_fail_event;
  const isForward = htlc.event_type === htlcTypes.forward;
  const isReceive = htlc.event_type === htlcTypes.receive;
  const isSend = htlc.event_type === htlcTypes.send;
  const outgoing = chanFormat({number: htlc.outgoing_channel_id});
  const outgoingId = Number(htlc.outgoing_htlc_id);
  const settleEvent = htlc.settle_event || {preimage: Buffer.alloc(Number())};

  // Exit early when there is no extended info, for failed forwards and settles
  if (!!htlc.forward_fail_event || !!htlc.settle_event) {
    return {
      at: createdAt.toISOString(),
      cltv_delta: undefined,
      external_failure: undefined,
      fee: undefined,
      fee_mtokens: undefined,
      in_channel: !!isSend ? undefined : incoming.channel,
      in_payment: !!isSend ? undefined : incomingId,
      internal_failure: undefined,
      is_confirmed: !!htlc.settle_event,
      is_failed: isFailure,
      is_receive: isReceive,
      is_send: isSend,
      mtokens: undefined,
      out_channel: !!isReceive ? undefined : outgoing.channel,
      out_payment: !!isReceive ? undefined : outgoingId,
      secret: bufferAsHex(settleEvent.preimage) || undefined,
      timeout: undefined,
      tokens: undefined,
    };
  }

  if (!htlc.forward_event && !htlc.link_fail_event) {
    throw new Error('ExpectedForwardEventOrLinkFailEventInHtlcEvent');
  }

  const {info} = htlc.forward_event || htlc.link_fail_event;

  const outgoingAmount = BigInt(info.outgoing_amt_msat);
  const outgoingCltvHeight = Number(info.outgoing_timelock);

  const cltvDelta = Number(info.incoming_timelock) - outgoingCltvHeight;
  const feeMtok = (BigInt(info.incoming_amt_msat) - outgoingAmount).toString();

  const {tokens} = safeTokens({mtokens: info.outgoing_amt_msat});

  return {
    at: createdAt.toISOString(),
    cltv_delta: !isForward ? undefined : cltvDelta,
    external_failure: (htlc.link_fail_event || {}).wire_failure,
    fee: !isForward ? undefined : safeTokens({mtokens: feeMtok}).tokens,
    fee_mtokens: !isForward ? undefined : feeMtok,
    in_channel: !!isSend ? undefined : incoming.channel,
    in_payment: !!isSend ? undefined : incomingId,
    internal_failure: (htlc.link_fail_event || {}).failure_detail,
    is_confirmed: false,
    is_failed: !!htlc.link_fail_event,
    is_receive: isReceive,
    is_send: isSend,
    mtokens: !!isReceive ? undefined : info.outgoing_amt_msat,
    out_channel: !!isReceive ? undefined : outgoing.channel,
    out_payment: !!isReceive ? undefined : outgoingId,
    secret: bufferAsHex(settleEvent.preimage) || undefined,
    timeout: !!isReceive ? undefined : outgoingCltvHeight,
    tokens: !!isReceive ? undefined : tokens,
  };
};
