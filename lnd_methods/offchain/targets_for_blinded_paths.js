const blindedPathFee = require('./blinded_path_fee');

const {isArray} = Array;
const isMtokens = n => typeof n === 'string' && /^\d+$/.test(n);
const lessFee = (max, fee) => (BigInt(max) - BigInt(fee)).toString();
const sumOf = (a, b) => (BigInt(a) + BigInt(b)).toString();

/** Derive probe targets to deliver an amount through blinded paths

  Targets are the introduction nodes of the paths, with the amount and the
  maximum fee adjusted for the path fees. Paths that have fees beyond the
  maximum fee are not included as targets.

  {
    [max_fee_mtokens]: <Maximum Fee Millitokens String>
    mtokens: <Millitokens To Deliver String>
    paths: [{
      base_fee_mtokens: <Accumulated Base Fee Millitokens String>
      cltv_delta: <Accumulated CLTV Expiry Delta Number>
      fee_rate: <Accumulated Fee Rate Millitokens Per Million Number>
      hops: [{
        encrypted_data: <Encrypted Recipient Data Hex String>
        relay_key: <Relaying Node Public Key Hex String>
      }]
      [introduction_node]: <Introduction Node Public Key Hex String>
      key: <First Hop Path Key Public Key Hex String>
      [max_htlc_mtokens]: <Maximum HTLC Millitokens String>
      [min_htlc_mtokens]: <Minimum HTLC Millitokens String>
    }]
  }

  @throws
  <Error>

  @returns
  {
    targets: [{
      cltv_delta: <Introduction Node Final CLTV Delta Number>
      destination: <Introduction Node Public Key Hex String>
      [max_fee_mtokens]: <Maximum Fee To Introduction Node Millitokens String>
      mtokens: <Millitokens To Send To Introduction Node String>
      path: <Blinded Path Object>
    }]
  }
*/
module.exports = ({max_fee_mtokens, mtokens, paths}) => {
  if (max_fee_mtokens !== undefined && !isMtokens(max_fee_mtokens)) {
    throw new Error('ExpectedMaxFeeMillitokensToDeriveTargetsForBlindedPaths');
  }

  if (!isMtokens(mtokens)) {
    throw new Error('ExpectedMillitokensToDeriveTargetsForBlindedPaths');
  }

  if (!isArray(paths) || !paths.length) {
    throw new Error('ExpectedArrayOfBlindedPathsToDeriveTargets');
  }

  const amount = BigInt(mtokens);

  // Blinded paths constrain the amount that can be delivered through them
  const allowed = paths.filter(path => {
    if (!!path.min_htlc_mtokens && amount < BigInt(path.min_htlc_mtokens)) {
      return false;
    }

    // A maximum of zero indicates that there is no maximum
    const max = path.max_htlc_mtokens;

    if (!!Number(max) && amount > BigInt(max)) {
      return false;
    }

    return true;
  });

  if (!allowed.length) {
    throw new Error('ExpectedBlindedPathAllowingAmountToProbe');
  }

  const fees = allowed.map(path => {
    return {path, fee: blindedPathFee({mtokens, path}).fee_mtokens};
  });

  const hasMaxFee = max_fee_mtokens !== undefined;

  // Paths that have fees beyond the maximum fee cannot be used
  const affordable = fees.filter(({fee}) => {
    return !hasMaxFee || BigInt(fee) <= BigInt(max_fee_mtokens);
  });

  return {
    targets: affordable.map(({fee, path}) => ({
      path,
      cltv_delta: path.cltv_delta,
      destination: path.introduction_node || path.hops[0].relay_key,
      max_fee_mtokens: !hasMaxFee ? undefined : lessFee(max_fee_mtokens, fee),
      mtokens: sumOf(mtokens, fee),
    })),
  };
};
