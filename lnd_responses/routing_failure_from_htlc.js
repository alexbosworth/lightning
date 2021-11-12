const paymentFailure = require('./payment_failure');
const rpcRouteAsRoute = require('./rpc_route_as_route');

/** Derive routing failure details from an HTLC

  {
    attempt_time_ns: <HTLC Sent At Epoch Time Nanoseconds String>
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
    resolve_time_ns: <HTLC Resolved At Epoch Time Nanoseconds String>
    route: {
      hops: [{
        amt_to_forward: <Tokens to Forward String>
        amt_to_forward_msat: <Millitokens to Forward String>
        chan_id: <Numeric Format Channel Id String>
        chan_capacity: <Channel Capacity Number>
        expiry: <Timeout Chain Height Number>
        fee: <Fee in Tokens Number>
        fee_msat: <Fee in Millitokens Number>
        [mpp_record]: {
          payment_addr: <Payment Identifier Buffer>
          total_amt_msat: <Total Payment Millitokens Amount String>
        }
        pub_key: <Next Hop Public Key Hex String>
        tlv_payload: <Has Extra TLV Data Bool>
      }]
      total_amt: <Total Tokens String>
      total_amt_msat: <Route Total Millitokens String>
      total_fees: <Route Fee Tokens String>
      total_fees_msat: <Route Total Fees Millitokens String>
      total_time_lock: <Route Total Timelock Number>
    }
    status: <HTLC Status String>
  }

  @throws
  <Error>

  @returns
  {
    [channel]: <Standard Format Channel Id String>
    index: <Failure Index Number>
    [mtokens]: <Millitokens String>
    [public_key]: <Public Key Hex String>
    reason: <Failure Reason String>
    route: {
      fee: <Total Route Fee Tokens To Pay Number>
      fee_mtokens: <Total Route Fee Millitokens To Pay String>
      hops: [{
        channel: <Standard Format Channel Id String>
        channel_capacity: <Channel Capacity Tokens Number>
        fee: <Fee Number>
        fee_mtokens: <Fee Millitokens String>
        forward: <Forward Tokens Number>
        forward_mtokens: <Forward Millitokens String>
        public_key: <Public Key Hex String>
        timeout: <Timeout Block Height Number>
      }]
      mtokens: <Total Route Millitokens String>
      [payment]: <Payment Identifier Hex String>
      timeout: <Expiration Block Height Number>
      tokens: <Total Route Tokens Number>
      [total_mtokens]: <Total Millitokens String>
    }
  }
*/
module.exports = htlc => {
  const from = htlc.route.hops[htlc.failure.failure_source_index - 1] || {};

  const failure = paymentFailure({
    channel: htlc.channel,
    failure: htlc.failure,
    index: htlc.index,
    key: from.pub_key,
  });

  const route = rpcRouteAsRoute(htlc.route);

  return {
    route,
    channel: failure.details.channel,
    index: failure.details.index,
    mtokens: route.mtokens,
    public_key: from.pub_key,
    reason: failure.message,
  };
};
