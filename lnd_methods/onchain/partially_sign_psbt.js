const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const bufferAsHex = buffer => buffer.toString('hex');
const hexAsBuf = hex => Buffer.from(hex, 'hex');
const {isBuffer} = Buffer;
const method = 'signPsbt';
const notSupported = /unknown.*walletrpc.WalletKit/;
const type = 'wallet';

/** Sign a PSBT to produce a partially signed PSBT

  Requires `onchain:write` permission

  Requires LND built with `walletrpc` tag

  This method is not supported in LND 0.14.1 and below

  {
    lnd: <Authenticated LND API Object>
    psbt: <Funded PSBT Hex String>
  }

  @returns via cbk or Promise
  {
    psbt: <Partially Signed PSBT Hex String>
  }
*/
module.exports = ({lnd, psbt}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedAuthenticatedLndToPartiallySignPsbt']);
        }

        if (!psbt) {
          return cbk([400, 'ExpectedPsbtToPartiallySign']);
        }

        return cbk();
      },

      // Partially sign the funded PSBT
      sign: ['validate', ({}, cbk) => {
        return lnd[type][method]({funded_psbt: hexAsBuf(psbt)}, (err, res) => {
          if (!!err && notSupported.test(err.details)) {
            return cbk([501, 'PartiallySignPsbtMethodNotSupported']);
          }

          if (!!err) {
            return cbk([503, 'UnexpectedErrorPartiallySigningPsbt', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedResponseWhenPartiallySigningPsbt']);
          }

          if (!isBuffer(res.signed_psbt)) {
            return cbk([503, 'ExpectedSignPsbtInSignPsbtResult']);
          }

          const signed = bufferAsHex(res.signed_psbt);

          // Detect a failure to add a partial signature
          if (signed === psbt) {
            return cbk([503, 'FailedToModifyInputPsbt']);
          }

          return cbk(null, {psbt: signed});
        });
      }],
    },
    returnResult({reject, resolve, of: 'sign'}, cbk));
  });
};
