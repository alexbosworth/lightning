const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const errorMessageNotFound = 'tower not found';
const hexAsBuffer = hex => Buffer.from(hex, 'hex');
const method = 'removeTower';
const type = 'tower_client';
const unimplementedError = '12 UNIMPLEMENTED: unknown service wtclientrpc.WatchtowerClient';

/** Disconnect a watchtower

  Requires LND built with `wtclientrpc` build tag

  Requires `offchain:write` permission

  {
    lnd: <Authenticated LND API Object>
    public_key: <Watchtower Public Key Hex String>
  }

  @returns via cbk or Promise
*/
module.exports = (args, cbk) => {
  return new Promise((resolve, reject) => {
    return new asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({method, type, lnd: args.lnd})) {
          return cbk([400, 'ExpectedLndToDisconnectWatchtower']);
        }

        if (!args.public_key) {
          return cbk([400, 'ExpectedPublicKeyOfWatchtowerToDisconnect']);
        }

        return cbk();
      },

      // Remove watchtower
      remove: ['validate', ({}, cbk) => {
        return args.lnd[type][method]({
          pubkey: hexAsBuffer(args.public_key),
        },
        err => {
          if (!!err && err.message === unimplementedError) {
            return cbk([501, 'ExpectedLndWithWtclientrpcTagToDisconnect']);
          }

          // Exit early when the tower is already not present
          if (!!err && err.details === errorMessageNotFound) {
            return cbk();
          }

          if (!!err) {
            return cbk([503, 'UnexpectedErrDisconnectingWatchtower', {err}]);
          }

          return cbk();
        });
      }],
    },
    returnResult({reject, resolve}, cbk));
  });
};
