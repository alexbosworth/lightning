const {isArray} = Array;
const isHex = n => !(n.length % 2) && /^[0-9A-F]*$/i.test(n);
const isHexString = n => typeof n === 'string' && isHex(n);
const isMtokens = n => typeof n === 'string' && /^\d+$/.test(n);
const isNumber = n => typeof n === 'number' && !isNaN(n);
const isPublicKey = n => isHexString(n) && /^0[23][0-9A-F]{64}$/i.test(n);

/** Determine if a blinded path has the expected form

  {
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
  }

  @returns
  <Is Blinded Path Bool>
*/
module.exports = path => {
  if (!path) {
    return false;
  }

  if (!isMtokens(path.base_fee_mtokens)) {
    return false;
  }

  if (!isNumber(path.cltv_delta)) {
    return false;
  }

  if (!isNumber(path.fee_rate)) {
    return false;
  }

  if (!isArray(path.hops) || !path.hops.length) {
    return false;
  }

  if (!path.hops.every(n => !!n && isHexString(n.encrypted_data))) {
    return false;
  }

  if (!path.hops.every(n => isPublicKey(n.relay_key))) {
    return false;
  }

  if (!isPublicKey(path.key)) {
    return false;
  }

  // The introduction node and the HTLC amount limits are optional
  const introduction = path.introduction_node;
  const max = path.max_htlc_mtokens;
  const min = path.min_htlc_mtokens;

  if (introduction !== undefined && !isPublicKey(introduction)) {
    return false;
  }

  if (max !== undefined && !isMtokens(max)) {
    return false;
  }

  if (min !== undefined && !isMtokens(min)) {
    return false;
  }

  return true;
};
