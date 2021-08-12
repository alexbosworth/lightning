const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {stateAsStateInfo} = require('./../../lnd_responses');
const {isLnd} = require('./../../lnd_requests');

const method = 'getState';
const type = 'status';

const noConnectionMessage = 'No connection established';

/** Get wallet status.

  This method is not supported on LND 0.12.1 and below

  {
    lnd: <Unauthenticated LND API Object>
  }

  @returns via cbk or Promise
  {
    state: <LND State String>
  }
*/
module.exports = ({lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedUnauthenticatedLndGrpcForGetStatusRequest']);
        }

        return cbk();
      },

      // Get wallet status
      getState: ['validate', ({}, cbk) => {
        return lnd[type][method]({}, (err, res) => {

          if (!!err && err.details === noConnectionMessage) {
            return cbk([503, 'FailedToConnectToDaemon']);
          }

          if (!!err) {
            return cbk([503, 'GetWalletStatusErr', {err}]);
          }

          try {
            return cbk(null, stateAsStateInfo(res));
          } catch (err) {
            return cbk([503, err.message]);
          }
        });
      }],
    },
    returnResult({reject, resolve, of: 'getState'}, cbk));
  });
};
