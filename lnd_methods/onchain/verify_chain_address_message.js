const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const bufferAsHex = buffer => buffer.toString('hex');
const hexAsBase64 = hex => Buffer.from(hex, 'hex').toString('base64');
const {isBuffer} = Buffer;
const isHex = n => !!n && !(n.length % 2) && /^[0-9A-F]*$/i.test(n);
const method = 'verifyMessageWithAddr';
const notSupportedError = 'unknown method VerifyMessageWithAddr for service walletrpc.WalletKit';
const utf8StringAsBuffer = str => Buffer.from(str, 'utf8');
const type = 'wallet';

/** Verify a chain address message using ECDSA

  Note: this method is not supported in LND versions 0.15.5 and below

  Requires LND built with `walletrpc` tag

  `onchain:write` permission is required

  {
    address: <Chain Address String>
    lnd: <Authenticated LND API Object>
    message: <Message to Verify String>
    signature: <Hex Encoded Signature String>
  }

  @returns via cbk or Promise
  {
    signed_by: <Public Key Hex String>
  }
*/
module.exports = ({address, lnd, message, signature}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!address) {
          return cbk([400, 'ExpectedChainAddressToVerifyChainAddressMessage']);
        }

        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedLndToVerifyChainAddressMessage']);
        }

        if (!message) {
          return cbk([400, 'ExpectedChainAddressMessageToVerify']);
        }

        if (!isHex(signature)) {
          return cbk([400, 'ExpectedHexSignatureToVerifyChainAddressMessage']);
        }

        return cbk();
      },

      // Check chain address message signature
      verify: ['validate', ({}, cbk) => {
        return lnd[type][method]({
          addr: address,
          msg: utf8StringAsBuffer(message),
          signature: hexAsBase64(signature),
        },
        (err, res) => {
          if (!!err && err.details === notSupportedError) {
            return cbk([501, 'BackingLndDoesNotSupportVerifyingAddrMessages']);
          }

          if (!!err) {
            return cbk([503, 'UnexpectedVerifyChainAddrMessageError', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedResultForVerifyChainMessageRequest']);
          }

          if (res.valid !== true) {
            return cbk([400, 'InvalidSignatureReceivedForChainAddress']);
          }

          if (!isBuffer(res.pubkey)) {
            return cbk([503, 'ExpectedPublicKeyInVerifyChainMessageResponse']);
          }

          return cbk(null, {signed_by: bufferAsHex(res.pubkey)});
        });
      }],
    },
    returnResult({reject, resolve, of: 'verify'}, cbk));
  });
};
