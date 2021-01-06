const {featureFlagDetails} = require('bolt09');

const routeFromRouteHint = require('./route_from_route_hint');
const {safeTokens} = require('./../bolt00');

const bufToHex = n => !n.length ? undefined : n.toString('hex');
const defaultExpireMs = 1000 * 60 * 60;
const {isArray} = Array;
const {isBuffer} = Buffer;
const isHash = n => !!n && /^[0-9A-F]{64}$/i.test(n);
const {keys} = Object;
const msPerSec = 1e3;
const {now} = Date;

/** Map payment request details to request details

  {
    [description]: <Description String>
    [description_hash]: <Description Hash Hex String>
    destination: <Pay to Public Key Hex String>
    cltv_expiry: <Final Hop CLTV Expiration Blocks Number String>
    expiry: <Invoice Expiration At Epoch Time Number String>
    features: {
      <Feature Bit Number>: {
        is_known: <Feature is Known Bool>
        is_required: <Feature is Required Bool>
        name: <Feature Name String>
      }
    }
    [fallback_addr]: <On-Chain Address String>
    num_msat: <Millitokens Count String>
    num_satoshis: <Invoiced Tokens Number>
    payment_addr: <Payment Identifier Bytes Buffer Object>
    payment_hash: <Payment Hash Hex String>
    route_hints: [{
      hop_hints: [{
        fee_base_msat: <Hop Base Fee Millitokens>
        chan_id: <Numeric Format Hop Channel Id String>
        cltv_delta: <Hop CLTV Delta Number>
        fee_rate: <Hop Fee Rate Number>
        node_id: <Hop Public Key Hex String>
      }]
    }]
    timestamp: <Created At Epoch Time Number String>
  }

  @throws
  <Error>

  @returns
  {
    chain_address: <Fallback Chain Address String>
    [cltv_delta]: <Final CLTV Delta Number>
    created_at: <Payment Request Created At ISO 8601 Date String>
    description: <Payment Description String>
    description_hash: <Payment Longer Description Hash String>
    destination: <Public Key String>
    expires_at: <ISO 8601 Date String>
    features: [{
      bit: <BOLT 09 Feature Bit Number>
      is_known: <Feature is Known Bool>
      is_required: <Feature Support is Required To Pay Bool>
      type: <Feature Type String>
    }]
    id: <Payment Hash String>
    mtokens: <Requested Millitokens String>
    [payment]: <Payment Identifier Hex Encoded String>
    routes: [[{
      [base_fee_mtokens]: <Base Routing Fee In Millitokens String>
      [channel]: <Standard Format Channel Id String>
      [cltv_delta]: <CLTV Blocks Delta Number>
      [fee_rate]: <Fee Rate In Millitokens Per Million Number>
      public_key: <Forward Edge Public Key Hex String>
    }]]
    safe_tokens: <Requested Tokens Rounded Up Number>
    tokens: <Requested Tokens Rounded Down Number>
  }
*/
module.exports = args => {
  if (!args.destination) {
    throw new Error('ExpectedDestinationInDecodedPaymentRequest');
  }

  if (!args.expiry) {
    throw new Error('ExpectedPaymentReqExpirationInDecodedPayReq');
  }

  if (!isBuffer(args.payment_addr)) {
    throw new Error('ExpectedPaymentAddrBufferInDecodePayReqResponse');
  }

  if (!isHash(args.payment_hash)) {
    throw new Error('ExpectedPaymentHashFromDecodePayReqResponse');
  }

  if (!args.num_satoshis) {
    throw new Error('ExpectedNumSatoshis');
  }

  if (!isArray(args.route_hints)) {
    throw new Error('ExpectedRouteHintsArray');
  }

  const routes = args.route_hints.forEach(route => routeFromRouteHint({
    destination: args.destination,
    hop_hints: route.hop_hints,
  }));

  if (!args.timestamp) {
    throw new Error('ExpectedPaymentRequestTimestamp');
  }

  const createdAtMs = Number(args.timestamp) * msPerSec;
  const expiresInMs = Number(args.expiry) * msPerSec;

  const expiryDateMs = createdAtMs + (expiresInMs || defaultExpireMs);

  return {
    chain_address: args.fallback_addr || undefined,
    cltv_delta: Number(args.cltv_expiry) || undefined,
    created_at: new Date(createdAtMs).toISOString(),
    description: args.description,
    description_hash: args.description_hash || undefined,
    destination: args.destination,
    expires_at: new Date(expiryDateMs).toISOString(),
    features: keys(args.features).map(bit => ({
      bit: Number(bit),
      is_known: args.features[bit].is_known,
      is_required: args.features[bit].is_required,
      type: featureFlagDetails({bit}).type,
    })),
    id: args.payment_hash,
    is_expired: now() > expiryDateMs,
    mtokens: args.num_msat,
    payment: bufToHex(args.payment_addr) || undefined,
    routes: args.route_hints.map(route => routeFromRouteHint({
      destination: args.destination,
      hop_hints: route.hop_hints,
    })),
    safe_tokens: safeTokens({mtokens: args.num_msat}).safe,
    tokens: Number(args.num_satoshis),
  };
};
