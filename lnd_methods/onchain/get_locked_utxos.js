const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const asMs = sec => Number(sec) * 1e3;
const bufferAsHex = buffer => buffer.toString('hex');
const {isArray} = Array;
const method = 'listLeases';
const type = 'wallet';
const unsuppportedErr = /unknown/;

/** Get locked unspent transaction outputs

  Requires `onchain:read` permission

  Requires LND built with `walletrpc` build tag

  This method is not supported on LND 0.12.1 and below

  {
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
  {
    utxos: [{
      lock_expires_at: <Lock Expires At ISO 8601 Date String>
      lock_id: <Locking Id Hex String>
      transaction_id: <Transaction Id Hex String>
      transaction_vout: <Transaction Output Index Number>
    }]
  }
*/
module.exports = ({lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedLndToGetLockedUtxos']);
        }

        return cbk();
      },

      // Query to list leased UTXOs
      getLockedUtxos: ['validate', ({}, cbk) => {
        return lnd[type][method]({}, (err, res) => {
          // LND 0.12.1 and below do not support listing leases
          if (!!err && unsuppportedErr.test(err.details)) {
            return cbk([501, 'BackingLndDoesNotSupportGettingLockedUtxos']);
          }

          if (!!err) {
            return cbk([503, 'UnexpectedErrorGettingLockedUtxos', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedResponseToGetLockedUtxoRequest']);
          }

          if (!isArray(res.locked_utxos)) {
            return cbk([503, 'ExpectedExpirationDateForLockedUtxo']);
          }

          try {
            const utxos = res.locked_utxos.map(lock => ({
              lock_expires_at: new Date(asMs(lock.expiration)).toISOString(),
              lock_id: bufferAsHex(lock.id),
              transaction_id: lock.outpoint.txid_str,
              transaction_vout: lock.outpoint.output_index,
            }));

            return cbk(null, {utxos});
          } catch (err) {
            return cbk([503, 'UnexpectedErrorParsingLockedUtxosResponse']);
          }
        });
      }],
    },
    returnResult({reject, resolve, of: 'getLockedUtxos'}, cbk));
  });
};
