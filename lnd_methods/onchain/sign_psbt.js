const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const bufferAsHex = buffer => buffer.toString('hex');
const hexAsBuf = hex => Buffer.from(hex, 'hex');
const {isBuffer} = Buffer;
const method = 'finalizePsbt';
const notSupported = /unknown.*walletrpc.WalletKit/;
const type = 'wallet';

/** Sign a PSBT to produce a finalized PSBT that is ready to broadcast

  Requires `onchain:write` permission

  Requires LND built with `walletrpc` tag

  This method is not supported in LND 0.11.1 and below

  {
    lnd: <Authenticated LND API Object>
    psbt: <Funded PSBT Hex String>
  }

  @returns via cbk or Promise
  {
    psbt: <Finalized PSBT Hex String>
    transaction: <Signed Raw Transaction Hex String>
  }
*/
module.exports = ({lnd, psbt}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedAuthenticatedLndToSignPsbt']);
        }

        if (!psbt) {
          return cbk([400, 'ExpectedPsbtToSignAndFinalize']);
        }

        return cbk();
      },

      // Sign and finalize the funded PSBT
      sign: ['validate', ({}, cbk) => {
        return lnd[type][method]({funded_psbt: hexAsBuf(psbt)}, (err, res) => {
          if (!!err && notSupported.test(err.details)) {
            return cbk([501, 'SignPsbtMethodNotSupported']);
          }

          if (!!err) {
            return cbk([503, 'UnexpectedErrorSigningPsbt', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedResponseWhenSigningPsbt']);
          }

          if (!isBuffer(res.raw_final_tx)) {
            return cbk([503, 'ExpectedRawFinalTransactionInPsbtResult']);
          }

          if (!isBuffer(res.signed_psbt)) {
            return cbk([503, 'ExpectedSignPsbtInSignPsbtResult']);
          }

          return cbk(null, {
            psbt: bufferAsHex(res.signed_psbt),
            transaction: bufferAsHex(res.raw_final_tx),
          });
        });
      }],
    },
    returnResult({reject, resolve, of: 'sign'}, cbk));
  });
};
