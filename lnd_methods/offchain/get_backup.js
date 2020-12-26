const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const bufferFromHex = hex => Buffer.from(hex, 'hex');
const hexFromBuffer = buffer => buffer.toString('hex');
const {isBuffer} = Buffer;
const isHash = n => /^[0-9A-F]{64}$/i.test(n);
const isNumber = n => !isNaN(n);
const method = 'exportChannelBackup';
const type = 'default';

/** Get the static channel backup for a channel

  Requires `offchain:read` permission

  {
    lnd: <Authenticated LND API Object>
    transaction_id: <Funding Transaction Id Hex String>
    transaction_vout: <Funding Transaction Output Index Number>
  }

  @returns via cbk or Promise
  {
    backup: <Channel Backup Hex String>
  }
*/
module.exports = (args, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({method, type, lnd: args.lnd})) {
          return cbk([400, 'ExpectedLndConnectionToGetChannelBackup']);
        }

        if (!isHash(args.transaction_id)) {
          return cbk([400, 'ExpectedTxIdOfChannelToGetChannelBackup']);
        }

        if (!isNumber(args.transaction_vout)) {
          return cbk([400, 'ExpectedTxOutputIndexToGetChannelBackup']);
        }

        return cbk();
      },

      // Get backup
      getBackup: ['validate', ({}, cbk) => {
        return args.lnd[type][method]({
          chan_point: {
            funding_txid_bytes: bufferFromHex(args.transaction_id).reverse(),
            output_index: args.transaction_vout,
          },
        },
        (err, res) => {
          if (!!err) {
            return cbk([503, 'UnexpectedErrExportingBackupForChannel', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedResultOfGetChannelBackupRequest']);
          }

          if (!isBuffer(res.chan_backup) || !res.chan_backup.length) {
            return cbk([503, 'UnexpectedResponseForChannelBackupRequest']);
          }

          return cbk(null, {backup: hexFromBuffer(res.chan_backup)});
        });
      }],
    },
    returnResult({reject, resolve, of: 'getBackup'}, cbk));
  });
};
