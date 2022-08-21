const {featureFlagDetails} = require('bolt09');

const htlcAsPayment = require('./htlc_as_payment');

const dateFrom = epoch => new Date(1e3 * epoch).toISOString();
const emptyHash = Buffer.alloc(32).toString('hex');
const {isArray} = Array;
const {keys} = Object;
const msPerSec = 1e3;
const mtokensPerToken = BigInt(1e3);

/** RPC Invoice as Invoice

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
    is_amp: <Invoice Was AMP Bool>
    is_keysend: <Invoice Was Push Payment Bool>
    memo: <Memo String>
    payment_addr: <Payment Identifying Secret Buffer Object>
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

  @throws
  <Error>

  @returns
  {
    [chain_address]: <Fallback Chain Address String>
    cltv_delta: <CLTV Delta Number>
    [confirmed_at]: <Settled at ISO 8601 Date String>
    [confirmed_index]: <Confirmed Index Number>
    created_at: <ISO 8601 Date String>
    description: <Description String>
    [description_hash]: <Description Hash Hex String>
    expires_at: <ISO 8601 Date String>
    features: [{
      bit: <BOLT 09 Feature Bit Number>
      is_known: <Feature is Known Bool>
      is_required: <Feature Support is Required To Pay Bool>
      type: <Feature Type String>
    }]
    id: <Payment Hash Hex String>
    index: <Index Number>
    [is_canceled]: <Invoice is Canceled Bool>
    is_confirmed: <Invoice is Confirmed Bool>
    [is_held]: <HTLC is Held Bool>
    is_private: <Invoice is Private Bool>
    [is_push]: <Invoice is Push Payment Bool>
    mtokens: <Millitokens String>
    [payment]: <Payment Identifying Secret Hex String>
    payments: [{
      [canceled_at]: <Payment Canceled At ISO 8601 Date String>
      [confirmed_at]: <Payment Settled At ISO 8601 Date String>
      created_at: <Payment Held Since ISO 860 Date String>
      created_height: <Payment Held Since Block Height Number>
      in_channel: <Incoming Payment Through Channel Id String>
      is_canceled: <Payment is Canceled Bool>
      is_confirmed: <Payment is Confirmed Bool>
      is_held: <Payment is Held Bool>
      messages: [{
        type: <Message Type Number String>
        value: <Raw Value Hex String>
      }]
      mtokens: <Incoming Payment Millitokens String>
      [pending_index]: <Pending Payment Channel HTLC Index Number>
      timeout: <HTLC CLTV Timeout Height Number>
      tokens: <Payment Tokens Number>
      [total_mtokens]: <Total Millitokens String>
    }]
    received: <Received Tokens Number>
    received_mtokens: <Received Millitokens String>
    [request]: <Bolt 11 Invoice String>
    secret: <Secret Preimage Hex String>
    tokens: <Tokens Number>
  }
*/
module.exports = args => {
  if (!args) {
    throw new Error('ExpectedResponseWhenLookingUpInvoice');
  }

  if (!args.creation_date) {
    throw new Error('ExpectedInvoiceCreationDateInResponse');
  }

  if (!Buffer.isBuffer(args.description_hash)) {
    throw new Error('ExpectedDescriptionHashInGetInvoiceResposne');
  }

  if (!args.expiry) {
    throw new Error('ExpectedExpirySecondsInGetInvoiceResponse');
  }

  if (!args.features) {
    throw new Error('ExpectedFeaturesInLookupInvoiceResponse');
  }

  if (!isArray(args.htlcs)) {
    throw new Error('ExpectedArrayOfResponseHtlcs');
  }

  args.htlcs.forEach(htlc => htlcAsPayment(htlc));

  if (args.memo === undefined) {
    throw new Error('ExpectedMemoInLookupInvoiceResponse');
  }

  if (!args.is_amp && !args.is_keysend && !args.payment_request) {
    throw new Error('ExpectedPaymentRequestForInvoice');
  }

  if (!Buffer.isBuffer(args.payment_addr)) {
    throw new Error('ExpectedPaymentAddressBufferInRpcInvoiceMessage');
  }

  if (!Buffer.isBuffer(args.r_hash)) {
    throw new Error('ExpectedPreimageHashInLookupInvoiceResponse');
  }

  if (!Buffer.isBuffer(args.r_preimage)) {
    throw new Error('ExpectedPreimageInLookupInvoiceResponse');
  }

  if (args.value === undefined) {
    throw new Error('ExpectedTokensValueInLookupInvoiceResponse');
  }

  const confirmedIndex = Number(args.settle_index);
  const createdAtEpochTime = Number(args.creation_date);
  const descHash = args.description_hash;
  const expiresInMs = Number(args.expiry) * msPerSec;
  const isAmpPush = !args.payment_request && !!args.is_amp;
  const isConfirmed = args.state === 'SETTLED';
  const mtok = (BigInt(args.value) * mtokensPerToken).toString();
  const payment = args.payment_addr.toString('hex');
  const settleDate = args.settle_date;

  const createdAtMs = createdAtEpochTime * msPerSec;
  const hasPaymentId = !!payment && payment !== emptyHash;

  return {
    chain_address: args.fallback_addr || undefined,
    cltv_delta: Number(args.cltv_expiry),
    confirmed_at: isConfirmed ? dateFrom(settleDate) : undefined,
    confirmed_index: confirmedIndex || undefined,
    created_at: new Date(createdAtMs).toISOString(),
    description: args.memo,
    description_hash: !descHash.length ? undefined : descHash.toString('hex'),
    expires_at: new Date(createdAtMs + expiresInMs).toISOString(),
    features: keys(args.features).map(bit => ({
      bit: Number(bit),
      is_known: args.features[bit].is_known,
      is_required: args.features[bit].is_required,
      type: featureFlagDetails({bit: Number(bit)}).type,
    })),
    id: args.r_hash.toString('hex'),
    index: Number(args.add_index),
    is_canceled: args.state === 'CANCELED' || undefined,
    is_confirmed: isConfirmed,
    is_held: args.state === 'ACCEPTED' || undefined,
    is_private: args.private,
    is_push: isAmpPush || args.is_keysend || undefined,
    mtokens: args.value_msat === '0' ? mtok : args.value_msat,
    payment: hasPaymentId ? payment : undefined,
    payments: args.htlcs.map(htlcAsPayment),
    received: Number(args.amt_paid_sat),
    received_mtokens: args.amt_paid_msat,
    request: args.payment_request || undefined,
    secret: args.r_preimage.toString('hex'),
    tokens: Number(args.value),
  };
};
