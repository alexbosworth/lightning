const asyncAuto = require('async/auto');
const asyncRetry = require('async/retry');
const {returnResult} = require('asyncjs-util');

const getPeers = require('./get_peers');
const {isLnd} = require('./../../lnd_requests');

const connectedErrMsg = /already.connected.to/;
const defaultInterval = retryCount => 50 * Math.pow(2, retryCount);
const defaultRetries = 10;
const isPublicKey = n => !!n && /^[0-9A-F]{66}$/i.test(n);
const method = 'connectPeer';
const msAsSeconds = ms => Math.ceil(ms / 1e3).toString();
const notSyncedError = 'chain backend is still syncing, server not active yet';
const selfKeyErrMsg = /connection.to.self/;
const type = 'default';

/** Add a peer if possible (not self, or already connected)

  Requires `peers:write` permission

  `timeout` is not supported in LND 0.11.0 and below

  {
    [is_temporary]: <Add Peer as Temporary Peer Bool> // Default: false
    lnd: <Authenticated LND API Object>
    public_key: <Public Key Hex String>
    [retry_count]: <Retry Count Number>
    [retry_delay]: <Delay Retry By Milliseconds Number>
    socket: <Host Network Address And Optional Port String> // ip:port
    [timeout]: <Connection Attempt Timeout Milliseconds Number>
  }

  @returns via cbk or Promise
*/
module.exports = (args, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({method, type, lnd: args.lnd})) {
          return cbk([400, 'ExpectedLndToAddPeer']);
        }

        if (!isPublicKey(args.public_key)) {
          return cbk([400, 'ExpectedPublicKeyOfPeerToAdd']);
        }

        if (!args.socket) {
          return cbk([400, 'ExpectedHostAndPortOfPeerToAdd']);
        }

        return cbk();
      },

      // Add Peer
      add: ['validate', ({}, cbk) => {
        const interval = args.retry_delay || defaultInterval;
        const pubkey = args.public_key;
        const retryCount = args.retry_count;

        const times = retryCount !== undefined ? retryCount : defaultRetries;

        return asyncRetry({interval, times}, cbk => {
          return args.lnd[type][method]({
            addr: {pubkey, host: args.socket},
            perm: !args.is_temporary,
            timeout: !!args.timeout ? msAsSeconds(args.timeout) : null,
          },
          err => {
            // Exit early when the peer is already added
            if (!!err && connectedErrMsg.test(err.message)) {
              return cbk();
            }

            // Exit early when the peer is the self-peer
            if (!!err && selfKeyErrMsg.test(err.message)) {
              return cbk();
            }

            if (!!err && err.details === notSyncedError) {
              return cbk([503, 'FailedToAddPeerBecausePeerStillSyncing']);
            }

            if (!!err) {
              return cbk([503, 'UnexpectedErrorAddingPeer', {err}]);
            }

            return getPeers({lnd: args.lnd}, (err, res) => {
              if (!!err) {
                return cbk(err);
              }

              const peer = res.peers.find(n => n.public_key === pubkey);

              if (!peer) {
                return cbk([503, 'FailedToSuccessfullyConnectToRemotePeer']);
              }

              return cbk();
            });
          });
        },
        cbk);
      }],
    },
    returnResult({reject, resolve}, cbk));
  });
};
