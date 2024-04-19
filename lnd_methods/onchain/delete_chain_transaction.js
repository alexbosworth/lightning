const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const isHash = n => !!n && /^[0-9A-F]{64}$/i.test(n);
const method = 'removeTransaction';
const notSupported = /unknown.*walletrpc.WalletKit/;
const statusSuccess = 'Successfully removed transaction';
const type = 'wallet';

/** Remove a chain transaction.

  Requires `onchain:write` permission

  This method is not supported on LND 0.17.5 and below

  {
    id: <Transaction Id Hex String>
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
*/
module.exports = ({id, lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isHash(id)) {
          return cbk([400, 'ExpectedIdentifyingTxHashOfChainTxToDelete']);
        }

        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedLndToDeleteChainTransaction']);
        }

        return cbk();
      },

      // Delete the transaction
      deleteTransaction: ['validate', ({}, cbk) => {
        return lnd[type][method]({txid: id}, (err, res) => {
          if (!!err && notSupported.test(err.details)) {
            return cbk([501, 'RemoveChainTransactionMethodNotSupported']);
          }

          if (!!err) {
            return cbk([503, 'UnexpectedDeleteChainTransactionError', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedResponseDeletingChainTransaction']);
          }

          if (res.status !== statusSuccess) {
            return cbk([503, 'UnexpectedResponseDeletingChainTransaction']);
          }

          return cbk();
        });
      }],
    },
    returnResult({reject, resolve}, cbk));
  });
};
