const asyncAuto = require('async/auto');
const asyncRetry = require('async/retry');
const {returnResult} = require('asyncjs-util');

const getWalletInfo = require('./get_wallet_info');
const {isLnd} = require('./../../lnd_requests');

const connectionFailureMessage = 'FailedToConnectToDaemon';
const interval = retryCount => 10 * Math.pow(2, retryCount);
const {isArray} = Array;
const method = 'stopDaemon';
const times = 10;
const type = 'default';

/** Stop the Lightning daemon.

  Requires `info:write` permission

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
        if (!isLnd({method, lnd, type})) {
          return cbk([400, 'ExpectedLndToStopDaemon']);
        }

        return cbk();
      },

      // Stop the daemon
      stopDaemon: ['validate', ({}, cbk) => {
        return lnd[type][method]({}, err => {
          if (!!err) {
            return cbk([503, 'UnexpectedErrorStoppingLightningDaemon', {err}]);
          }

          return cbk();
        });
      }],

      // Poll wallet info until it fails to know when the daemon is really off
      waitForGetInfoFailure: ['stopDaemon', ({stopDaemon}, cbk) => {
        return asyncRetry({interval, times}, cbk => {
          return getWalletInfo({lnd}, err => {
            if (!err) {
              return cbk([503, 'ExpectedDaemonError']);
            }

            const [, message] = err;

            if (message !== 'FailedToConnectToDaemon') {
              return cbk([503, 'ExpectedDaemonShutdown']);
            }

            return cbk();
          });
        },
        cbk);
      }],
    },
    returnResult({reject, resolve}, cbk));
  });
};
