const {rpcRouteAsRoute} = require('./../lnd_responses');

const bufferAsHex = buffer => buffer.toString('hex');

/** Derive payment details from a pay via route request

  {
    payment_hash: <Payment Hash Buffer Object>
    route: {
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
      total_amt_msat: <Route Total Millitokens String>
      total_fees_msat: <Route Total Fees Millitokens String>
      total_time_lock: <Route Total Timelock Number>
    }
  }

  @returns
  {
    id: <Payment Hash Hex String>
    route: {
      fee: <Route Fee Tokens Number>
      fee_mtokens: <Route Fee Millitokens String>
      hops: [{
        channel: <Standard Format Channel Id String>
        channel_capacity: <Channel Capacity Tokens Number>
        fee: <Fee Tokens Number>
        fee_mtokens: <Fee Millitokens String>
        forward: <Forward Tokens Number>
        forward_mtokens: <Forward Millitokens String>
        public_key: <Forward Edge Public Key Hex String>
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
module.exports = args => {
  return {
    id: bufferAsHex(args.payment_hash),
    route: rpcRouteAsRoute(args.route),
  };
};
