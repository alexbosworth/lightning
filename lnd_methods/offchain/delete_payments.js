const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const method = 'deleteAllPayments';
const type = 'default';

/** Delete all records of payments

  Requires `offchain:write` permission

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
          return cbk([400, 'ExpectedAuthenticatedLndToDeleteAllPayments']);
        }

        return cbk();
      },

      // Delete all payments
      deletePayments: ['validate', ({}, cbk) => {
        return lnd[type][method]({}, err => {
          if (!!err) {
            return cbk([503, 'UnexpectedErrorDeletingAllPayments', {err}]);
          }

          return cbk();
        });
      }],
    },
    returnResult({reject, resolve}, cbk));
  });
};
