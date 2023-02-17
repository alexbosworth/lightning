const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const base64AsHex = base64 => Buffer.from(base64, 'base64').toString('hex');
const notSupportedError = 'unknown method SignMessageWithAddr for service walletrpc.WalletKit';
const method = 'signMessageWithAddr';
const utf8AsBuffer = utf8 => Buffer.from(utf8, 'utf8');
const type = 'wallet';

/** Sign a chain address message using ECDSA

  Note: this method is not supported in LND versions 0.15.5 and below

  Requires LND built with `walletrpc` tag

  `onchain:write` permission is required

  {
    address: <Chain Address String>
    lnd: <Authenticated LND API Object>
    message: <Message To Sign String>
  }

  @returns via cbk or Promise
  {
    signature: <Hex Encoded Signature String>
  }
*/
module.exports = ({address, lnd, message}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!address) {
          return cbk([400, 'ExpectedChainAddressToSignChainAddressMessage']);
        }

        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedLndToSignChainAddressMessage']);
        }

        if (!message) {
          return cbk([400, 'ExpectedMessageToSignChainAddressMessage']);
        }

        return cbk();
      },

      // Sign message
      sign: ['validate', ({}, cbk) => {
        return lnd[type][method]({
          addr: address,
          msg: utf8AsBuffer(message),
        },
        (err, res) => {
          if (!!err && err.details === notSupportedError) {
            return cbk([501, 'BackingLndDoesNotSupportSigningChainMessages']);
          }

          if (!!err) {
            return cbk([503, 'UnexpectedSignChainAddressMessageError', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedResponseToSignChainAddrMessageRequest']);
          }

          if (!res.signature) {
            return cbk([503, 'ExpectedSignatureForChainMessageSignRequest']);
          }

          return cbk(null, {signature: base64AsHex(res.signature)});
        });
      }],
    },
    returnResult({reject, resolve, of: 'sign'}, cbk));
  });
};
