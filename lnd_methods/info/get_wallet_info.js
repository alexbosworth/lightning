const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {infoAsWalletInfo} = require('./../../lnd_responses');
const {isLnd} = require('./../../lnd_requests');

const cannotConnectMessage = 'failed to connect to all addresses';
const connectFailMessage = '14 UNAVAILABLE: channel is in state TRANSIENT_FAILURE';
const connectionFailureLndErrorMessage = 'Connect Failed';
const lockedLndErrorMessage = 'unknown service lnrpc.Lightning';
const noConnectionMessage = 'No connection established';

/** Get overall wallet info.

  Requires `info:read` permission

  {
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
  {
    active_channels_count: <Active Channels Count Number>
    alias: <Node Alias String>
    chains: [<Chain Id Hex String>]
    color: <Node Color String>
    current_block_hash: <Best Chain Hash Hex String>
    current_block_height: <Best Chain Height Number>
    features: [{
      bit: <BOLT 09 Feature Bit Number>
      is_known: <Feature is Known Bool>
      is_required: <Feature Support is Required Bool>
      type: <Feature Type String>
    }]
    is_synced_to_chain: <Is Synced To Chain Bool>
    [is_synced_to_graph]: <Is Synced To Network Graph Bool>
    latest_block_at: <Latest Known Block At Date String>
    peers_count: <Peer Count Number>
    pending_channels_count: <Pending Channels Count Number>
    public_key: <Public Key String>
    [uris]: [<The URIs of the Node String>]
    version: <LND Version String>
  }
*/
module.exports = ({lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({lnd, method: 'getInfo', type: 'default'})) {
          return cbk([400, 'ExpectedAuthenticatedLndGrpcForGetInfoRequest']);
        }

        return cbk();
      },

      // Get wallet info
      getWalletInfo: ['validate', ({}, cbk) => {
        return lnd.default.getInfo({}, (err, res) => {
          if (!!err && err.details === lockedLndErrorMessage) {
            return cbk([503, 'LndLocked']);
          }

          if (!!err && err.details === cannotConnectMessage) {
            return cbk([503, 'FailedToConnectToDaemon']);
          }

          if (!!err && err.details === connectionFailureLndErrorMessage) {
            return cbk([503, 'FailedToConnectToDaemon']);
          }

          if (!!err && err.message === connectFailMessage) {
            return cbk([503, 'FailedToConnectToDaemon']);
          }

          if (!!err && err.details === noConnectionMessage) {
            return cbk([503, 'FailedToConnectToDaemon']);
          }

          if (!!err) {
            return cbk([503, 'GetWalletInfoErr', {err}]);
          }

          try {
            return cbk(null, infoAsWalletInfo(res));
          } catch (err) {
            return cbk([503, err.message]);
          }
        });
      }],
    },
    returnResult({reject, resolve, of: 'getWalletInfo'}, cbk));
  });
};
