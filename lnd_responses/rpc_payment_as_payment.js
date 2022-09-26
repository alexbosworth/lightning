const {parsePaymentRequest} = require('invoices');

const rpcAttemptHtlcAsAttempt = require('./rpc_attempt_htlc_as_attempt');
const {safeTokens} = require('./../bolt00');

const emptyHash = Buffer.alloc(32).toString('hex');
const {isArray} = Array;
const msPerSecond = 1e3;
const nanoSecsPerMillisecond = BigInt(1e6);
const routePublicKeys = route => route.hops.map(n => n.public_key);

/** Payment details from RPC payment details

  {
    creation_date: <Creation Date Epoch Time Seconds String>
    creation_time_ns: <Creation Date Epoch Time Nanoseconds String>
    failure_reason: <Payment Failure Reason String>
    fee_msat: <Fee Paid in Millitokens String>
    fee_sat: <Fee Paid in Tokens String>
    htlcs: [{
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
    }]
    payment_hash: <Preimage SHA256 Hash Hex String>
    payment_index: <Payment Index String>
    payment_preimage: <Payment Secret Preimage Hex String>
    payment_request: <BOLT 11 Payment Request String>
    status: <Payment State String>
    value: <Tokens String>
    value_msat: <Paid Millitokens String>
    value_sat: <Paid Tokens String>
  }

  @throws
  <Error>

  @returns
  {
    attempts: [{
      [confirmed_at]: <Payment Attempt Succeeded At ISO 8601 Date String>
      created_at: <Attempt Was Started At ISO 8601 Date String>
      [failed_at]: <Payment Attempt Failed At ISO 8601 Date String>
      [failure]: {
        code: <Error Type Code Number>
        [details]: {
          [channel]: <Standard Format Channel Id String>
          [height]: <Error Associated Block Height Number>
          [index]: <Failed Hop Index Number>
          [mtokens]: <Error Millitokens String>
          [policy]: {
            base_fee_mtokens: <Base Fee Millitokens String>
            cltv_delta: <Locktime Delta Number>
            fee_rate: <Fees Charged in Millitokens Per Million Number>
            [is_disabled]: <Channel is Disabled Bool>
            max_htlc_mtokens: <Maximum HLTC Millitokens Value String>
            min_htlc_mtokens: <Minimum HTLC Millitokens Value String>
            updated_at: <Updated At ISO 8601 Date String>
          }
          [timeout_height]: <Error CLTV Timeout Height Number>
          [update]: {
            chain: <Chain Id Hex String>
            channel_flags: <Channel Flags Number>
            extra_opaque_data: <Extra Opaque Data Hex String>
            message_flags: <Message Flags Number>
            signature: <Channel Update Signature Hex String>
          }
        }
        message: <Error Message String>
      }
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
        timeout: <Timeout Block Height Number>
        tokens: <Total Fee-Inclusive Tokens Number>
        [total_mtokens]: <Total Millitokens String>
      }
    }]
    created_at: <Payment at ISO-8601 Date String>
    [destination]: <Destination Node Public Key Hex String>
    [fee]: <Paid Routing Fee Rounded Down Tokens Number>
    [fee_mtokens]: <Paid Routing Fee in Millitokens String>
    hops: [<First Route Hop Public Key Hex String>]
    id: <Payment Preimage Hash String>
    [index]: <Payment Add Index Number>
    is_confirmed: <Payment is Confirmed Bool>
    is_outgoing: <Transaction Is Outgoing Bool>
    mtokens: <Millitokens Sent to Destination String>
    [request]: <BOLT 11 Payment Request String>
    [safe_fee]: <Payment Forwarding Fee Rounded Up Tokens Number>
    safe_tokens: <Payment Tokens Sent to Destination Rounded Up Number>
    [secret]: <Payment Preimage Hex String>
    tokens: <Rounded Down Tokens Sent to Destination Number>
  }
*/
module.exports = payment => {
  if (!payment) {
    throw new Error('ExpectedPaymentInRpcResponse');
  }

  if (!payment.creation_date) {
    throw new Error('ExpectedCreationDateInRpcPaymentDetails');
  }

  if (typeof payment.fee_sat !== 'string') {
    throw new Error('ExpectedPaymentFeeInRpcPaymentDetails');
  }

  if (!isArray(payment.htlcs)) {
    throw new Error('ExpectedHtlcsArrayInRpcPaymentDetails');
  }

  if (!payment.payment_hash) {
    throw new Error('ExpectedPaymentHashInRpcPaymentDetails');
  }

  if (!payment.payment_preimage) {
    throw new Error('ExpectedPaymentPreimageInRpcPaymentDetails');
  }

  if (typeof payment.value_sat !== 'string') {
    throw new Error('ExpectedPaymentValueInRpcPaymentDetails');
  }

  const creationDateEpochMs = (() => {
    // Exit early when creation time nanoseconds is not defined
    if (payment.creation_time_ns === Number().toString()) {
      return Number(payment.creation_date) * msPerSecond;
    }

    return Number(BigInt(payment.creation_time_ns) / nanoSecsPerMillisecond);
  })();

  const attempts = payment.htlcs.map(htlc => rpcAttemptHtlcAsAttempt(htlc));
  const index = Number(payment.payment_index) || undefined;
  const request = payment.payment_request || undefined;

  // Exit early when there were no attempts
  if (!attempts.length) {
    const {destination} = !!request ? parsePaymentRequest({request}) : {};

    return {
      attempts,
      destination,
      index,
      request,
      confirmed_at: undefined,
      created_at: new Date(creationDateEpochMs).toISOString(),
      fee: undefined,
      fee_mtokens: undefined,
      hops: [],
      id: payment.payment_hash,
      is_confirmed: false,
      is_outgoing: true,
      mtokens: payment.value_msat,
      safe_fee: undefined,
      safe_tokens: safeTokens({mtokens: payment.value_msat}).safe,
      secret: undefined,
      tokens: safeTokens({mtokens: payment.value_msat}).tokens,
    };
  }

  const hasPreimage = payment.payment_preimage !== emptyHash;
  const [attempt] = attempts;
  const successes = attempts.filter(n => n.is_confirmed);

  const [confirmedAt] = successes.map(n => n.confirmed_at).sort().reverse();
  const path = routePublicKeys(attempt.route);

  const [destination, ...hops] = path.reverse();

  // Exit early when the payment was never settled
  if (!hasPreimage) {
    return {
      attempts,
      destination,
      index,
      request,
      confirmed_at: undefined,
      created_at: new Date(creationDateEpochMs).toISOString(),
      fee: undefined,
      fee_mtokens: undefined,
      hops: hops.reverse(),
      id: payment.payment_hash,
      is_confirmed: false,
      is_outgoing: true,
      mtokens: payment.value_msat,
      safe_fee: undefined,
      safe_tokens: safeTokens({mtokens: payment.value_msat}).safe,
      secret: undefined,
      tokens: safeTokens({mtokens: payment.value_msat}).tokens,
    };
  }

  return {
    attempts,
    destination,
    index,
    request,
    confirmed_at: confirmedAt || undefined,
    created_at: new Date(creationDateEpochMs).toISOString(),
    fee: safeTokens({mtokens: payment.fee_msat}).tokens,
    fee_mtokens: payment.fee_msat,
    hops: hops.reverse(),
    id: payment.payment_hash,
    is_confirmed: true,
    is_outgoing: true,
    mtokens: payment.value_msat,
    safe_fee: safeTokens({mtokens: payment.fee_msat}).safe,
    safe_tokens: safeTokens({mtokens: payment.value_msat}).safe,
    secret: payment.payment_preimage,
    tokens: safeTokens({mtokens: payment.value_msat}).tokens,
  };
};
