const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const action = 1;
const errorUnimplemented = 'unknown service peersrpc.Peers';
const method = 'updateNodeAnnouncement';
const type = 'peers';

/** Remove an existing advertised p2p socket address

  Note: this method is not supported in LND versions 0.14.5 and below

  Requires LND built with `peersrpc` build tag

  Requires `peers:write` permissions

  {
    lnd: <Authenticated LND API Object>
    socket: <Remove Socket Address String>
  }

  @returns via cbk or Promise
*/
module.exports = ({lnd, socket}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedLndToRemoveExternalSocket']);
        }

        if (!socket) {
          return cbk([400, 'ExpectedHostAndPortOfSocketToRemove']);
        }

        return cbk();
      },

      // Stop external socket from being advertised
      add: ['validate', ({}, cbk) => {
        return lnd[type][method]({
          address_updates: [{action, address: socket}],
        },
        err => {
          if (!!err && err.details === errorUnimplemented) {
            return cbk([400, 'ExpectedPeersRpcLndBuildTagToRemoveSocket']);
          }

          if (!!err) {
            return cbk([503, 'UnexpectedErrorRemovingExternalSocket', {err}]);
          }

          return cbk();
        });
      }],
    },
    returnResult({reject, resolve}, cbk));
  });
};
