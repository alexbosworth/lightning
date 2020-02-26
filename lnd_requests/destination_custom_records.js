const BN = require('bn.js');

const bufferFromHex = hex => Buffer.from(hex, 'hex');
const {concat} = Buffer;
const dummyMppType = '5262155';
const endian = 'be';
const mtokensByteLength = 8;
const notFound = -1;
const trimByte = 0;

/** Destination custom records

  This includes a dummy record due to LND 0.9.0 not supporting payment/total

  {
    [messages]: [{
      type: <Message To Final Destination Type Number String>
      value: <Message To Final Destination Raw Value Hex Encoded String>
    }]
    [payment]: <Payment Identifier Hex Strimng>
    [total_mtokens]: <Total Millitokens of Shards String>
  }

  @returns
  {
    tlv: {
      <Type Number String>: <Value Buffer Object>
    }
  }
*/
module.exports = args => {
  const tlv = (args.messages || []).reduce((sum, {type, value}) => {
    sum[type] = bufferFromHex(value);

    return sum;
  },
  {});

  // Exit early when there is no payment identifier
  if (!args.payment) {
    return {tlv};
  }

  const payment = bufferFromHex(args.payment);

  // A dummy MPP record is set to simulate the size of the real record

  // Exit early when there is no total mtokens
  if (!args.total_mtokens) {
    tlv[dummyMppType] = payment;

    return {tlv};
  }

  const mtokens = new BN(args.total_mtokens).toArrayLike(
    Buffer,
    endian,
    mtokensByteLength
  );

  const trimIndex = mtokens.lastIndexOf(trimByte) + [trimByte].length;

  tlv[dummyMppType] = concat([payment, mtokens.slice(trimIndex)]);

  return {tlv};
};
