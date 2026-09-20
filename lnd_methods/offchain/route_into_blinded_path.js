const {safeTokens} = require('./../../bolt00');

const blindedChannel = '0x0x0';
const {isArray} = Array;
const isHex = n => !(n.length % 2) && /^[0-9A-F]*$/i.test(n);
const isHexString = n => typeof n === 'string' && isHex(n);
const isNumber = n => typeof n === 'number' && !isNaN(n);
const isPublicKey = n => isHexString(n) && /^0[23][0-9A-F]{64}$/i.test(n);
const minTimeout = 1;
const noMtokens = '0';
const noTokens = 0;
const noTimeout = 0;

/** Extend a route that ends at a blinded path introduction node into the path

  The route to the introduction node must forward the millitokens to deliver
  to the destination plus the fees of the blinded path for that amount.

  Hops inside of a blinded path get their forwarding details from their
  encrypted data so they carry no amount or timeout, except for the final hop
  which is given the amount to deliver and a timeout at the introduction node
  timeout less the path CLTV delta: a current height baseline. The introduction
  node is given the path key and takes the path fee.

  {
    mtokens: <Millitokens To Deliver To Destination String>
    path: {
      cltv_delta: <Accumulated CLTV Expiry Delta Number>
      hops: [{
        encrypted_data: <Encrypted Recipient Data Hex String>
        relay_key: <Relaying Node Public Key Hex String>
      }]
      [introduction_node]: <Introduction Node Public Key Hex String>
      key: <First Hop Path Key Public Key Hex String>
    }
    route: {
      [confidence]: <Route Confidence Score Out Of One Million Number>
      fee: <Total Fee Tokens To Pay Number>
      fee_mtokens: <Total Fee Millitokens To Pay String>
      hops: [{
        channel: <Standard Format Channel Id String>
        fee: <Fee Number>
        fee_mtokens: <Fee Millitokens String>
        forward: <Forward Tokens Number>
        forward_mtokens: <Forward Millitokens String>
        public_key: <Public Key Hex String>
        timeout: <Timeout Block Height Number>
      }]
      mtokens: <Total Millitokens To Pay String>
      safe_fee: <Payment Forwarding Fee Rounded Up Tokens Number>
      safe_tokens: <Payment Sent Tokens Rounded Up Number>
      timeout: <Expiration Block Height Number>
      tokens: <Total Tokens To Pay Number>
    }
    [total_mtokens]: <Total Millitokens Across Paths String>
  }

  @throws
  <Error>

  @returns
  {
    route: {
      [confidence]: <Route Confidence Score Out Of One Million Number>
      fee: <Total Fee Tokens To Pay Number>
      fee_mtokens: <Total Fee Millitokens To Pay String>
      hops: [{
        channel: <Standard Format Channel Id String>
        [encrypted_data]: <Blinded Path Encrypted Data Hex String>
        fee: <Fee Number>
        fee_mtokens: <Fee Millitokens String>
        forward: <Forward Tokens Number>
        forward_mtokens: <Forward Millitokens String>
        [path_key]: <Blinded Path Key Hex String>
        public_key: <Public Key Hex String>
        timeout: <Timeout Block Height Number>
      }]
      mtokens: <Total Millitokens To Pay String>
      safe_fee: <Payment Forwarding Fee Rounded Up Tokens Number>
      safe_tokens: <Payment Sent Tokens Rounded Up Number>
      timeout: <Expiration Block Height Number>
      tokens: <Total Tokens To Pay Number>
      [total_mtokens]: <Total Millitokens Across Paths String>
    }
  }
*/
module.exports = ({mtokens, path, route, total_mtokens}) => {
  if (!mtokens) {
    throw new Error('ExpectedMillitokensToDeliverToRouteIntoBlindedPath');
  }

  if (!path) {
    throw new Error('ExpectedBlindedPathToExtendRouteInto');
  }

  if (!isNumber(path.cltv_delta)) {
    throw new Error('ExpectedBlindedPathCltvDeltaToExtendRouteInto');
  }

  if (!isArray(path.hops) || !path.hops.length) {
    throw new Error('ExpectedBlindedPathHopsToExtendRouteInto');
  }

  if (!path.hops.every(n => !!n && isHexString(n.encrypted_data))) {
    throw new Error('ExpectedBlindedPathHopEncryptedDataToExtendRouteInto');
  }

  if (!path.hops.every(n => isPublicKey(n.relay_key))) {
    throw new Error('ExpectedBlindedPathHopRelayKeysToExtendRouteInto');
  }

  if (!isPublicKey(path.key)) {
    throw new Error('ExpectedBlindedPathKeyToExtendRouteInto');
  }

  if (!route || !isArray(route.hops) || !route.hops.length) {
    throw new Error('ExpectedRouteToIntroductionNodeToExtendIntoBlindedPath');
  }

  // The first hop of a blinded path is the introduction node
  const [introductionHop, ...blindedHops] = path.hops;
  const [introduction] = route.hops.slice().reverse();

  const introductionNode = path.introduction_node || introductionHop.relay_key;

  if (introduction.public_key !== introductionNode) {
    throw new Error('ExpectedRouteEndingAtBlindedPathIntroductionNode');
  }

  // Hops leading up to the introduction node are unchanged
  const hops = route.hops.slice(Number(), route.hops.indexOf(introduction));

  // Exit early when the introduction node is also the destination of the path
  if (!blindedHops.length) {
    hops.push({
      channel: introduction.channel,
      encrypted_data: introductionHop.encrypted_data,
      fee: introduction.fee,
      fee_mtokens: introduction.fee_mtokens,
      forward: introduction.forward,
      forward_mtokens: introduction.forward_mtokens,
      path_key: path.key,
      public_key: introduction.public_key,
      timeout: introduction.timeout,
    });

    return {
      route: {
        hops,
        confidence: route.confidence,
        fee: route.fee,
        fee_mtokens: route.fee_mtokens,
        mtokens: route.mtokens,
        safe_fee: route.safe_fee,
        safe_tokens: route.safe_tokens,
        timeout: route.timeout,
        tokens: route.tokens,
        total_mtokens: total_mtokens || undefined,
      },
    };
  }

  // The path fee is what arrives at the introduction node beyond the delivery
  const arriving = BigInt(introduction.forward_mtokens);

  const pathFeeMtokens = arriving - BigInt(mtokens);

  if (pathFeeMtokens < BigInt(noMtokens)) {
    throw new Error('ExpectedRouteToIntroductionNodeToForwardDeliveryAmount');
  }

  // The final hop timeout is at the height baseline, before the path delta
  const finalTimeout = introduction.timeout - path.cltv_delta;

  if (!(finalTimeout >= minTimeout)) {
    throw new Error('ExpectedRouteTimeoutToCoverBlindedPathCltvDelta');
  }

  const feeMtokens = (BigInt(route.fee_mtokens) + pathFeeMtokens).toString();

  // The introduction node forwards into the path and takes the path fee
  hops.push({
    channel: introduction.channel,
    encrypted_data: introductionHop.encrypted_data,
    fee: safeTokens({mtokens: pathFeeMtokens.toString()}).tokens,
    fee_mtokens: pathFeeMtokens.toString(),
    forward: noTokens,
    forward_mtokens: noMtokens,
    path_key: path.key,
    public_key: introduction.public_key,
    timeout: noTimeout,
  });

  // Blinded hops forward using their encrypted data, the last one delivers
  blindedHops.forEach((hop, i) => {
    const isFinal = i === blindedHops.length - [hop].length;

    return hops.push({
      channel: blindedChannel,
      encrypted_data: hop.encrypted_data,
      fee: noTokens,
      fee_mtokens: noMtokens,
      forward: isFinal ? safeTokens({mtokens}).tokens : noTokens,
      forward_mtokens: isFinal ? mtokens : noMtokens,
      public_key: hop.relay_key,
      timeout: isFinal ? finalTimeout : noTimeout,
    });
  });

  return {
    route: {
      hops,
      confidence: route.confidence,
      fee: safeTokens({mtokens: feeMtokens}).tokens,
      fee_mtokens: feeMtokens,
      mtokens: route.mtokens,
      safe_fee: safeTokens({mtokens: feeMtokens}).safe,
      safe_tokens: route.safe_tokens,
      timeout: route.timeout,
      tokens: route.tokens,
      total_mtokens: total_mtokens || undefined,
    },
  };
};
