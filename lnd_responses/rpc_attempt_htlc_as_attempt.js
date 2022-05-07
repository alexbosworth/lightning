const {attemptStates} = require('./constants');

const rpcRouteAsRoute = require('./rpc_route_as_route');

const nsAsMs = ns => Number(BigInt(ns) / BigInt(1e6));

/** Payment attempt details from RPC HTLCAttempt message

  {
    attempt_id: <Attempt Id String>
    attempt_time_ns: <Attempt Created At Epoch Time Nanoseconds String>
    failure: {
      [channel_update]: {
        base_fee: <Base Fee Millitokens Number>
        chain_hash: <Chain Hash Buffer Object>
        [chan_id]: <Numeric Channel Id String>
        channel_flags: <Channel Flags Number>
        extra_opaque_data: <Extra Opaque Data Buffer Object>
        fee_rate: <Fee Rate Number>
        htlc_maximum_msat: <Maximum HTLC Millitokens Number>
        htlc_minimum_msat: <Minimum HTLC Millitokens Number>
        message_flags: <Message Flags Number>
        signature: <Signature Buffer Object>
        time_lock_delta: <CLTV Delta Number>
        timestamp: <Update Epoch Time Seconds Number>
      }
      code: <Failure Code String>
      [failure_source_index]: <Failed Hop Index Number>
      height: <Height Number>
      htlc_msat: <HTLC Millitokens String>
    }
    resolve_time_ns: <Attempt Resolved At Epoch Time Nanoseconds String>
    route: [{
      hops: [{
        amt_to_forward_msat: <Millitokens to Forward String>
        chan_id: <Numeric Format Channel Id String>
        chan_capacity: <Channel Capacity Number>
        custom_records: {
          <UInt64 String>: <Record Data Buffer>
        }
        expiry: <Timeout Chain Height Number>
        fee_msat: <Fee in Millitokens String>
        [mpp_record]: {
          payment_addr: <Payment Identifier Buffer>
          total_amt_msat: <Total Payment Millitokens Amount String>
        }
        [pub_key]: <Next Hop Public Key Hex String>
        tlv_payload: <Has Extra TLV Data Bool>
      }]
      total_amt: <Total Tokens String>
      total_amt_msat: <Route Total Millitokens String>
      total_fees: <Route Fee Tokens String>
      total_fees_msat: <Route Total Fees Millitokens String>
      total_time_lock: <Route Total Timelock Number>
    }]
    status: <HTLC Status String>
  }

  @throws
  <Error>

  @returns
  {
    [confirmed_at]: <Payment Attempt Succeeded At ISO 8601 Date String>
    created_at: <Attempt Was Started At ISO 8601 Date String>
    [failed_at]: <Payment Attempt Failed At ISO 8601 Date String>
    is_confirmed: <Payment Attempt Succeeded Bool>
    is_failed: <Payment Attempt Failed Bool>
    is_pending: <Payment Attempt is Waiting For Resolution Bool>
    route: {
      fee: <Route Fee Tokens Number>
      fee_mtokens: <Route Fee Millitokens String>
      hops: [{
        channel: <Standard Format Channel Id String>
        channel_capacity: <Channel Capacity Tokens Number>
        fee: <Fee Number>
        fee_mtokens: <Fee Millitokens String>
        forward: <Forward Tokens Number>
        forward_mtokens: <Forward Millitokens String>
        [public_key]: <Forward Edge Public Key Hex String>
        [timeout]: <Timeout Block Height Number>
      }]
      mtokens: <Total Fee-Inclusive Millitokens String>
      [payment]: <Payment Identifier Hex String>
      [timeout]: <Timeout Block Height Number>
      tokens: <Total Fee-Inclusive Tokens Number>
      [total_mtokens]: <Total Payment Millitokens String>
    }
  }
*/
module.exports = attempt => {
  if (!attempt) {
    throw new Error('ExpectedRpcAttemptDetailsToDeriveAttempt');
  }

  if (!attempt.attempt_time_ns) {
    throw new Error('ExpectedRpcAttemptStartTimeNs');
  }

  if (!attempt.resolve_time_ns) {
    throw new Error('ExpectedRpcAttemptResolveTimeNs');
  }

  if (!attempt.route) {
    throw new Error('ExpectedRouteAttemptedInRpcAttemptDetails');
  }

  if (!attempt.status) {
    throw new Error('ExpectedAttemptStatusInRpcAttemptDetails');
  }

  const route = rpcRouteAsRoute(attempt.route);

  if (attempt.status === attemptStates.confirmed) {
    return {
      route,
      confirmed_at: new Date(nsAsMs(attempt.resolve_time_ns)).toISOString(),
      created_at: new Date(nsAsMs(attempt.attempt_time_ns)).toISOString(),
      failed_at: undefined,
      is_confirmed: true,
      is_failed: false,
      is_pending: false,
    };
  }

  if (attempt.status === attemptStates.failed) {
    return {
      route,
      confirmed_at: undefined,
      created_at: new Date(nsAsMs(attempt.attempt_time_ns)).toISOString(),
      failed_at: new Date(nsAsMs(attempt.resolve_time_ns)).toISOString(),
      is_confirmed: false,
      is_failed: true,
      is_pending: false,
    };
  }

  return {
    route,
    confirmed_at: undefined,
    created_at: new Date(nsAsMs(attempt.attempt_time_ns)).toISOString(),
    failed_at: undefined,
    is_confirmed: false,
    is_failed: false,
    is_pending: attempt.status === attemptStates.pending,
  };
};
