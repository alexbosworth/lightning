const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const deleteAllMethod = 'deleteAllPayments';
const deleteOneMethod = 'deletePayment';
const hexAsBuffer = hex => Buffer.from(hex, 'hex');
const isHash = n => /^[0-9A-F]{64}$/i.test(n);
const notSupported = /unknown/;
const type = 'default';

/** Delete failed payment attempt records

  Requires `offchain:write` permission

  Method not supported on LND 0.12.1 or below

  `id` is not supported on LND 0.13.4 or below

  {
    [id]: <Delete Only Failed Attempt Records For Payment With Hash Hex String>
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
*/
module.exports = ({id, lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!!id && !isHash(id)) {
          return cbk([400, 'ExpectedPaymentHashToDeleteFailedPayAttempts']);
        }

        if (!isLnd({lnd, type, method: deleteAllMethod})) {
          return cbk([400, 'ExpectedAuthenticatedLndToDeleteFailedAttempts']);
        }

        return cbk();
      },

      // Delete failed payments
      deletePayments: ['validate', ({}, cbk) => {
        const method = !id ? deleteAllMethod : deleteOneMethod;

        return lnd[type][method]({
          failed_htlcs_only: true,
          id: !!id ? hexAsBuffer(id) : undefined,
        },
        err => {
          if (!!err && notSupported.test(err.details)) {
            return cbk([501, 'DeleteFailedPaymentAttemptsMethodNotSupported']);
          }

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
