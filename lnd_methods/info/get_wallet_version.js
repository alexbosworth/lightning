const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');
const {packageTypes} = require('./../../grpc');
const {versions} = require('./constants');

const hasTag = (res, tag) => res.build_tags.includes(tag);
const {isArray} = Array;
const isHash = n => !!n && /^[0-9A-F]{40}$/i.test(n);
const isNumber = n => !isNaN(n);
const method = 'getVersion';
const type = 'version';
const unknownServiceErr = 'unknown service verrpc.Versioner';

/** Get wallet version

  Tags are self-reported by LND and are not guaranteed to be accurate

  Requires `info:read` permission

  {
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
  {
    build_tags: [<Build Tag String>]
    commit_hash: <Commit SHA1 160 Bit Hash Hex String>
    is_autopilotrpc_enabled: <Is Autopilot RPC Enabled Bool>
    is_chainrpc_enabled: <Is Chain RPC Enabled Bool>
    is_invoicesrpc_enabled: <Is Invoices RPC Enabled Bool>
    is_signrpc_enabled: <Is Sign RPC Enabled Bool>
    is_walletrpc_enabled: <Is Wallet RPC Enabled Bool>
    is_watchtowerrpc_enabled: <Is Watchtower Server RPC Enabled Bool>
    is_wtclientrpc_enabled: <Is Watchtower Client RPC Enabled Bool>
    [version]: <Recognized LND Version String>
  }
*/
module.exports = ({lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedAuthenticatedLndForGetVersionRequest']);
        }

        return cbk();
      },

      // Get wallet version
      getWalletVersion: ['validate', ({}, cbk) => {
        return lnd[type][method]({}, (err, res) => {
          if (!!err && err.details === unknownServiceErr) {
            return cbk([501, 'VersionMethodUnsupported']);
          }

          if (!!err) {
            return cbk([503, 'UnexpectedGetWalletVersion', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedResponseForGetVersion']);
          }

          if (!isNumber(res.app_minor)) {
            return cbk([503, 'ExpectedAppMinorVersionInGetVersionResponse']);
          }

          if (!isNumber(res.app_patch)) {
            return cbk([503, 'ExpectedAppMinorVersionInGetVersionResponse']);
          }

          if (!isArray(res.build_tags)) {
            return cbk([503, 'ExpectedArrayOfBuildTagsInGetVersionResponse']);
          }

          // Some builds do not report a commit hash
          if (!!res.commit_hash && !isHash(res.commit_hash)) {
            return cbk([503, 'ExpectedCommitHashInGetVersionResponse']);
          }

          return cbk(null, {
            build_tags: res.build_tags,
            commit_hash: res.commit_hash,
            is_autopilotrpc_enabled: hasTag(res, packageTypes.Autopilot),
            is_chainrpc_enabled: hasTag(res, packageTypes.ChainNotifier),
            is_invoicesrpc_enabled: hasTag(res, packageTypes.Invoices),
            is_signrpc_enabled: hasTag(res, packageTypes.Signer),
            is_walletrpc_enabled: hasTag(res, packageTypes.WalletKit),
            is_watchtowerrpc_enabled: hasTag(res, packageTypes.Watchtower),
            is_wtclientrpc_enabled: hasTag(res, packageTypes.WatchtowerClient),
            version: versions[res.commit_hash] || undefined,
          });
        });
      }],
    },
    returnResult({reject, resolve, of: 'getWalletVersion'}, cbk));
  });
};
