const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {rpcWalletStateAsState} = require('./../../lnd_responses');
const {isLnd} = require('./../../lnd_requests');

const method = 'getState';
const type = 'status';

const noConnectionMessage = 'No connection established';
const unsupportedMessage = 'unknown service lnrpc.State';

/** Get wallet status.

  This method is not supported on LND 0.12.1 and below

  `is_ready` is not supported on LND 0.13.4 and below

  {
    lnd: <Unauthenticated LND API Object>
  }

  @returns via cbk or Promise
  {
    [is_absent]: <Wallet Not Created Bool>
    [is_active]: <Wallet Is Active Bool>
    [is_locked]: <Wallet File Encrypted And Wallet Not Active Bool>
    [is_ready]: <Wallet Is Ready For RPC Calls Bool>
    [is_starting]: <Wallet Is Starting Up Bool>
    [is_waiting]: <Wallet Is Waiting To Start Bool>
  }
*/
module.exports = ({lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedUnauthenticatedLndForGetStatusRequest']);
        }

        return cbk();
      },

      // Get wallet status
      getState: ['validate', ({}, cbk) => {
        return lnd[type][method]({}, (err, res) => {
          if (!!err && err.details === noConnectionMessage) {
            return cbk([503, 'FailedToConnectToDaemonToGetWalletStatus']);
          }

          if (!!err && err.details === unsupportedMessage) {
            return cbk([501, 'GetWalletStatusMethodUnsupported']);
          }

          if (!!err) {
            return cbk([503, 'UnexpectedGetWalletStatusError', {err}]);
          }

          try {
            return cbk(null, rpcWalletStateAsState(res));
          } catch (err) {
            return cbk([503, err.message]);
          }
        });
      }],
    },
    returnResult({reject, resolve, of: 'getState'}, cbk));
  });
};
