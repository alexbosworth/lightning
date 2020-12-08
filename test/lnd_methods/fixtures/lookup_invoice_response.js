/** Lookup invoice mock response

  {}

  @returns
  {
    add_index: <Invoice Added Index String>
    amt_paid_msat: <Amount Received Millitokens String>
    amt_paid_sat: <Amount Received Tokens String>
    cltv_expiry: <CLTV Expiration Delta String>
    creation_date: <Creation Date Epoch Seconds String>
    description_hash: <Description Hash Buffer Object>
    expiry: <Payment Expiration Seconds String>
    fallback_addr: <On-Chain Fallback Address String>
    features: {
      <Feature Number>: {
        is_known: <Feature Is Known Bool>
        is_required: <Feature Is Required Bool>
        name: <Feature Name String>
      }
    }
    htlcs: [{
      accept_height: <HTLC Held Since Height Number>
      accept_time: <HTLC Held Since Epoch Time Number String>
      amt_msat: <HTLC Amount Millitokens String>
      chan_id: <Numeric Channel Id String>
      custom_records: {
        <UInt64 String>: <Record Data Buffer>
      }
      expiry_height: <HTLC CLTV Expiration Height Number>
      htlc_index: <Channel HTLC Index Number String>
      mpp_total_amt_msat: <Total Payment Millitokens String>
      resolve_time: <HTLC Removed At Epoch Time Number String>
      state: <HTLC Lifecycle State String>
    }]
    is_keysend: <Invoice Was Push Payment Bool>
    memo: <Memo String>
    payment_request: <BOLT 11 Payment Request String>
    private: <Invoice Includes Routing Hints Bool>
    r_hash: <Preimage Hash Buffer Object>
    r_preimage: <Preimage Buffer Object>
    route_hints: [{
      hop_hints: [{
        chan_id: <Numeric Channel Id String>
        cltv_expiry_delta: <CLTV Delta Number>
        fee_base_msat: <Base Fee Number>
        fee_proportional_millionths: <Fee Parts Millitokens Per Million Number>
        node_id: <Node Public Key Hex String>
      }]
    }]
    settle_date: <Confirmation Date Epoch Seconds String>
    settle_index: <Invoice Settled Index String>
    settled: <Invoice Is Confirmed Bool>
    state: <Invoice Status String>
    value: <Tokens Value String>
    value_msat: <Milliltokens Value String>
  }
*/
module.exports = ({}) => {
  return {
    add_index: '1',
    amt_paid_msat: '0',
    amt_paid_sat: '0',
    cltv_expiry: '1',
    creation_date: '1',
    description_hash: Buffer.alloc(Number()),
    expiry: '1',
    fallback_addr: '',
    features: {},
    htlcs: [],
    is_keysend: false,
    memo: '',
    payment_addr: Buffer.alloc(0),
    payment_request: 'request',
    private: false,
    r_hash: Buffer.alloc(32),
    r_preimage: Buffer.alloc(32),
    route_hints: [],
    settle_date: '1',
    settle_index: 1,
    settled: false,
    state: 'CANCELED',
    value: '1',
    value_msat: '1000',
  };
};
