const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const hexAsBuffer = hex => Buffer.from(hex, 'hex');
const unimplementedError = '12 UNIMPLEMENTED: unknown service wtclientrpc.WatchtowerClient';
const type = 'tower_client';

/** Update a watchtower

  Requires LND built with `wtclientrpc` build tag

  Requires `offchain:write` permission

  {
    [add_socket]: <Add Socket String>
    lnd: <Authenticated LND API Object>
    public_key: <Watchtower Public Key Hex String>
    [remove_socket]: <Remove Socket String>
  }

  @returns via cbk or Promise
*/
module.exports = (args, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check argument
      validate: cbk => {
        if (!args.add_socket && !args.remove_socket) {
          return cbk([400, 'ExpectedASocketToAddToOrRemoveFromWatchtower']);
        }

        if (!isLnd({type, lnd: args.lnd, method: 'addTower'})) {
          return cbk([400, 'ExpectedAuthenticatedLndToUpdateWatchtower']);
        }

        if (!args.public_key) {
          return cbk([400, 'ExpectedPublicKeyToUpdateWatchtower']);
        }

        return cbk();
      },

      // Add socket
      addSocket: ['validate', ({}, cbk) => {
        // Exit early when there is no socket to add
        if (!args.add_socket) {
          return cbk();
        }

        return args.lnd.tower_client.addTower({
          address: args.add_socket,
          pubkey: hexAsBuffer(args.public_key),
        },
        err => {
          if (!!err) {
            return cbk([503, 'UnexpectedAddSocketToWatchtowerError', {err}]);
          }

          return cbk();
        });
      }],

      // Remove socket
      removeSocket: ['validate', ({}, cbk) => {
        // Exit early when there is no socket to remove
        if (!args.remove_socket) {
          return cbk();
        }

        return args.lnd.tower_client.removeTower({
          address: args.remove_socket,
          pubkey: hexAsBuffer(args.public_key),
        },
        err => {
          if (!!err && err.message === unimplementedError) {
            return cbk([501, 'ExpectedWatchtowerClientLndToGetPolicy']);
          }

          if (!!err) {
            return cbk([503, 'UnexpectedRemoveSocketFromTowerError', {err}]);
          }

          return cbk();
        });
      }],
    },
    returnResult({reject, resolve}, cbk));
  });
};
