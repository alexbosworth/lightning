const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const method = 'resetMissionControl';
const type = 'router';

/** Delete all forwarding reputations

  Requires `offchain:write` permission

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
        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedLndToDeleteForwardingReputations']);
        }

        return cbk();
      },

      // Delete reputations
      deleteReputations: ['validate', ({}, cbk) => {
        return lnd[type][method]({}, err => {
          if (!!err) {
            return cbk([503, 'UnexpectedErrorResettingMissionControl', {err}]);
          }

          return cbk();
        });
      }],
    },
    returnResult({reject, resolve}, cbk));
  });
};
