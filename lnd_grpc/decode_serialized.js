const isBase64 = require('is-base64');
const isHex = require('is-hex');

const {from} = Buffer;

/** Get decoded Base64 or Hex encoded data

  {
    [serialized]: <Serialized Data String>
  }

  @returns
  {
    [decoded]: <Deserialized Data Buffer>
  }
*/
module.exports = ({serialized}) => {
  if (isBase64(serialized)) {
    return {decoded: from(serialized, 'base64')};
  }

  if (isHex(serialized)) {
    return {decoded: from(serialized, 'hex')};
  }

  return {};
};
