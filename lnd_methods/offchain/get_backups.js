const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {backupsFromSnapshot} = require('./../../lnd_responses');
const {isLnd} = require('./../../lnd_requests');

const method = 'exportAllChannelBackups';
const type = 'default';

/** Get all channel backups

  Requires `offchain:read` permission

  {
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
  {
    backup: <All Channels Backup Hex String>
    channels: [{
      backup: <Individualized Channel Backup Hex String>
      transaction_id: <Channel Funding Transaction Id Hex String>
      transaction_vout: <Channel Funding Transaction Output Index Number>
    }]
  }
*/
module.exports = ({lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedLndGrpcToExportAllChannelBackups']);
        }

        return cbk();
      },

      // Get backups snapshot
      getBackupsSnapshot: ['validate', ({}, cbk) => {
        return lnd[type][method]({}, (err, res) => {
          if (!!err) {
            return cbk([503, 'UnexpectedErrorGettingAllChanBackups', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedChanBackupsResponseForBackupsRequest']);
          }

          return cbk(null, backupsFromSnapshot(res));
        });
      }],
    },
    returnResult({reject, resolve, of: 'getBackupsSnapshot'}, cbk));
  });
};
