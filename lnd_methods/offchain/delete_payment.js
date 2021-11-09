const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const hexAsBytes = hex => Buffer.from(hex, 'hex');
const isHash = n => !!n && /^[0-9A-F]{64}$/i.test(n);
const method = 'deletePayment';
const notSupported = /unknown/;
const type = 'default';

/** Delete a payment record

  Requires `offchain:write` permission

  Note: this method is not supported on LND 0.13.4 and below

  {
    id: <Payment Preimage Hash Hex String>
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
          return cbk([400, 'ExpectedPaymentHashToDeletePaymentRecord']);
        }

        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedAuthenticatedLndToDeletePayment']);
        }

        return cbk();
      },

      // Delete the payment
      deletePayment: ['validate', ({}, cbk) => {
        return lnd[type][method]({payment_hash: hexAsBytes(id)}, err => {
          if (!!err && notSupported.test(err.details)) {
            return cbk([501, 'DeletePaymentMethodNotSupported']);
          }

          if (!!err) {
            return cbk([503, 'UnexpectedErrorDeletingPayment', {err}]);
          }

          return cbk();
        });
      }],
    },
    returnResult({reject, resolve}, cbk));
  });
};
