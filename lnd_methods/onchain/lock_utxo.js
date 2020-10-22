const {randomBytes} = require('crypto');

const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const bufferToHex = buffer => buffer.toString('hex');
const expirationAsDate = epoch => new Date(Number(epoch) * 1e3).toISOString();
const isHash = n => !!n && /^[0-9A-F]{64}$/i.test(n);
const isNumber = n => !isNaN(n);
const makeId = () => randomBytes(32);
const method = 'leaseOutput';
const type = 'wallet';
const unsuppportedErr = /unknown/;

/** Lock UTXO

  Requires `onchain:write` permission

  Requires LND built with `walletrpc` build tag

  {
    [id]: <Lock Identifier Hex String>
    lnd: <Authenticated LND API Object>
    transaction_id: <Unspent Transaction Id Hex String>
    transaction_vout: <Unspent Transaction Output Index Number>
  }

  @returns via cbk or Promise
  {
    expires_at: <Lock Expires At ISO 8601 Date String>
    id: <Locking Id Hex String>
  }
*/
module.exports = (args, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({method, type, lnd: args.lnd})) {
          return cbk([400, 'ExpectedLndToLockUtxo']);
        }

        if (!isHash(args.transaction_id)) {
          return cbk([400, 'ExpectedUnspentTransactionIdToLockUtxo']);
        }

        if (!isNumber(args.transaction_vout)) {
          return cbk([400, 'ExpectedTransactionOutputIndexToLockUtxo']);
        }

        return cbk();
      },

      // Lock the UTXO
      lock: ['validate', ({}, cbk) => {
        const id = args.id || makeId();

        return args.lnd[type][method]({
          id,
          outpoint: {
            output_index: args.transaction_vout,
            txid_str: args.transaction_id,
          },
        },
        (err, res) => {
          if (!!err && unsuppportedErr.test(err.details)) {
            return cbk([501, 'BackingLndDoesNotSupportLockingUtxos']);
          }

          if (!!err) {
            return cbk([503, 'UnexpectedErrorLockingUtxo', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedResponseToLockUtxoRequest']);
          }

          if (!res.expiration) {
            return cbk([503, 'ExpectedExpirationDateForLockedUtxo']);
          }

          return cbk(null, {
            expires_at: expirationAsDate(res.expiration),
            id: bufferToHex(id),
          });
        });
      }],
    },
    returnResult({reject, resolve, of: 'lock'}, cbk));
  });
};
