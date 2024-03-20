const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const action = 1;
const errorUnimplemented = 'unknown service peersrpc.Peers';
const method = 'updateNodeAnnouncement';
const type = 'peers';

/** Remove an advertised feature from the graph node announcement

  Note: this method is not supported in LND versions 0.14.5 and below

  Requires LND built with `peersrpc` build tag

  Requires `peers:write` permissions

  {
    feature: <BOLT 09 Feature Bit Number>
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
*/
module.exports = ({feature, lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!feature) {
          return cbk([400, 'ExpectedFeatureToRemoveAnnouncementFeature']);
        }

        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedLndToRemoveNodeAnnouncementFeature']);
        }

        return cbk();
      },

      // Update the node features with the updated feature
      updateFeatures: ['validate', ({}, cbk) => {
        return lnd[type][method]({
          feature_updates: [{action, feature_bit: feature}],
        },
        (err, res) => {
          if (!!err && err.details === errorUnimplemented) {
            return cbk([400, 'ExpectedPeersRpcLndBuildTagToRemoveFeature']);
          }

          if (!!err) {
            return cbk([503, 'UnexpectedErrorRemovingNodeFeature', {err}]);
          }

          return cbk();
        });
      }],
    },
    returnResult({reject, resolve}, cbk));
  });
};
