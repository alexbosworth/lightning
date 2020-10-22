const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const bufferFromHex = hex => Buffer.from(hex, 'hex');
const isId = n => /^[0-9A-F]{64}$/i.test(n);
const method = 'fundingStateStep';
const type = 'default';

/** Cancel an external funding pending channel

  {
    id: <Pending Channel Id Hex String>
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
*/
module.exports = ({id, lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isId(id)) {
          return cbk([400, 'ExpectedPendingChannelIdToCancelPendingChannel']);
        }

        if (!lnd) {
          return cbk([400, 'ExpectedAuthenticatedLndToCancelPendingChannel']);
        }

        return cbk();
      },

      // Cancel the pending channel request
      cancel: ['validate', ({}, cbk) => {
        return lnd[type][method]({
          shim_cancel: {pending_chan_id: bufferFromHex(id)},
        },
        err => {
          if (!!err) {
            return cbk([503, 'UnexpectedErrorCancelingPendingChannel', {err}]);
          }

          return cbk();
        });
      }],
    },
    returnResult({reject, resolve}, cbk));
  });
};
