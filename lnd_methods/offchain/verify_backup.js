const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const hexAsBuffer = hex => Buffer.from(hex, 'hex');
const isHex = n => !!n && !(n.length % 2) && /^[0-9A-F]*$/i.test(n);
const method = 'verifyChanBackup';
const type = 'default';

/** Verify a channel backup

  Requires `offchain:read` permission

  {
    backup: <Individual Channel Backup Hex String>
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
  {
    [err]: <LND Error Object>
    is_valid: <Backup is Valid Bool>
  }
*/
module.exports = ({backup, lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isHex(backup)) {
          return cbk([400, 'ExpectedChannelBackupToVerify']);
        }

        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedLndToVerifyChannelBackup']);
        }

        return cbk();
      },

      // Verify backup
      verify: ['validate', ({}, cbk) => {
        return lnd[type][method]({
          single_chan_backups: {
            chan_backups: [{chan_backup: hexAsBuffer(backup)}],
          },
        },
        err => {
          if (!!err) {
            return cbk(null, {err, is_valid: false});
          }

          return cbk(null, {is_valid: true});
        });
      }],
    },
    returnResult({reject, resolve, of: 'verify'}, cbk));
  });
};
