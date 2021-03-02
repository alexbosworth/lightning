const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const method = 'deleteAllPayments';
const type = 'default';

/** Delete failed payment attempt records

  Requires `offchain:write` permission

  Method not supported on LND 0.12.1 or below

  {
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
*/
module.exports = ({lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedAuthenticatedLndToDeleteFailedAttempts']);
        }

        return cbk();
      },

      // Delete failed payments
      deletePayments: ['validate', ({}, cbk) => {
        return lnd[type][method]({failed_htlcs_only: true}, err => {
          if (!!err) {
            return cbk([503, 'UnexpectedErrorDeletingFailedAttempts', {err}]);
          }

          return cbk();
        });
      }],
    },
    returnResult({reject, resolve}, cbk));
  });
};
