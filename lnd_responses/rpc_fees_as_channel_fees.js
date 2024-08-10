const {chanFormat} = require('bolt07');

const {safeTokens} = require('./../bolt00');

const discount = fee => (!fee ? 0 : -fee).toString();
const inverse = rate => !rate ? 0 : -rate;
const isHash = n => /^[0-9A-F]{64}$/i.test(n);
const notFound = -1;
const outpointDivider = ':';

/** Derive channel fees from RPC fees

  {
    base_fee_msat: <Base Fee Milllitokens String>
    chan_id: <Numeric Format Channel Id String>
    channel_point: <Channel Funding Outpoint String>
    fee_per_mil: <Millitokens Per Million Fee Rate String>
    inbound_base_fee_msat: <Inbound Base Fee Millitokens Number>
    inbound_fee_per_mil: <Inbound Fee Rate PPM Number>
  }

  @returns
  {
    base_fee: <Base Flat Fee Tokens Rounded Up Number>
    base_fee_mtokens: <Base Flat Fee Millitokens String>
    fee_rate: <Fee Rate in Millitokens Per Million Number>
    id: <Standard Format Channel Id String>
    inbound_base_discount_mtokens: <Source Based Base Fee Reduction String>
    inbound_rate_discount: <Source Based Per Million Rate Reduction Number>
    transaction_id: <Channel Funding Transaction Id Hex String>
    transaction_vout: <Funding Outpoint Output Index Number>
  }
*/
module.exports = channel => {
  if (!channel) {
    throw new Error('ExpectedRpcChannelPolicyToDeriveChannelFees');
  }

  if (!channel.channel_point) {
    throw new Error('ExpectedChannelPoint');
  }

  if (channel.channel_point.indexOf(outpointDivider) === notFound) {
    throw new Error('UnexpectedChannelPointFormat');
  }

  const [txId, index] = channel.channel_point.split(outpointDivider);

  if (!isHash(txId)) {
    throw new Error('ExpectedChannelPointTransactionId');
  }

  if (!index) {
    throw new Error('ExpectedChannelPointIndex');
  }

  if (!channel.base_fee_msat) {
    throw new Error('ExpectedBaseFeeForChannel');
  }

  if (!channel.fee_per_mil) {
    throw new Error('ExpectedFeeRatePerMillion');
  }

  return {
    base_fee: safeTokens({mtokens: channel.base_fee_msat}).tokens,
    base_fee_mtokens: channel.base_fee_msat,
    fee_rate: Number(channel.fee_per_mil),
    id: chanFormat({number: channel.chan_id}).channel,
    inbound_base_discount_mtokens: discount(channel.inbound_base_fee_msat),
    inbound_rate_discount: inverse(channel.inbound_fee_per_mil),
    transaction_id: txId,
    transaction_vout: Number(index),
  };
};
