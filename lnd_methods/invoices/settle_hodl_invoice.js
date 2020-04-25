const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const bufferFromHex = hex => Buffer.from(hex, 'hex');
const expectedSecretLen = 64;
const htlcNotYetAcceptedError = 'invoice still open';
const invalidSecretError = 'unable to locate invoice';
const isHex = n => !(n.length % 2) && /^[0-9A-F]*$/i.test(n);

/** Settle HODL invoice

  Requires LND built with `invoicesrpc` build tag

  Requires `invoices:write` permission

  {
    lnd: <Authenticated LND API Object>
    secret: <Payment Preimage Hex String>
  }

  @returns via cbk or Promise
*/
module.exports = ({lnd, secret}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({lnd, method: 'settleInvoice', type: 'invoices'})) {
          return cbk([400, 'ExpectedInvoicesLndToSettleHodlInvoice']);
        }

        if (!secret || !isHex(secret) || secret.length !== expectedSecretLen) {
          return cbk([400, 'ExpectedPaymentPreimageToSettleHodlInvoice']);
        }

        return cbk();
      },

      // Settle invoice
      settle: ['validate', ({}, cbk) => {
        return lnd.invoices.settleInvoice({
          preimage: bufferFromHex(secret),
        },
        err => {
          if (!!err && err.details === htlcNotYetAcceptedError) {
            return cbk([402, 'CannotSettleHtlcBeforeHtlcReceived']);
          }

          if (!!err && err.details === invalidSecretError) {
            return cbk([404, 'SecretDoesNotMatchAnyExistingHodlInvoice']);
          }

          if (!!err) {
            return cbk([503, 'UnexpectedErrorWhenSettlingHodlInvoice', {err}]);
          }

          return cbk();
        });
      }],
    },
    returnResult({reject, resolve}, cbk));
  });
};
