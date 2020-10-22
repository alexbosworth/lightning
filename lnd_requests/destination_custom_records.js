const bufferFromHex = hex => Buffer.from(hex, 'hex');

/** Destination custom records

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

  return {tlv};
};
