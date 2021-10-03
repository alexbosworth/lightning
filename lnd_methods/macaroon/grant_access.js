const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');
const permissions = require('./permissions');
const urisForMethod = require('./uris_for_method');

const accessDenied = 'permission denied';
const flatten = arr => [].concat(...arr);
const hexAsBase64 = hex => Buffer.from(hex, 'hex').toString('base64');
const isHex = n => !!n && !(n.length % 2) && /^[0-9A-F]*$/i.test(n);
const {keys} = Object;
const method = 'bakeMacaroon';
const notSupported = 'unknown service lnrpc.Lightning';
const permissionSeparator = ':';
const type = 'default';
const uniq = arr => Array.from(new Set(arr));
const uriAsPermission = uri => `uri:${uri}`;

/** Give access to the node by making a macaroon access credential

  Specify `id` to allow for revoking future access

  Requires `macaroon:generate` permission

  Note: access once given cannot be revoked. Access is defined at the LND level
  and version differences in LND can result in expanded access.

  Note: `id` is not supported in LND versions 0.11.0 and below

  `methods` is not supported in LND versions 0.11.0 and below

  {
    [id]: <Macaroon Id Positive Numeric String>
    [is_ok_to_adjust_peers]: <Can Add or Remove Peers Bool>
    [is_ok_to_create_chain_addresses]: <Can Make New Addresses Bool>
    [is_ok_to_create_invoices]: <Can Create Lightning Invoices Bool>
    [is_ok_to_create_macaroons]: <Can Create Macaroons Bool>
    [is_ok_to_derive_keys]: <Can Derive Public Keys Bool>
    [is_ok_to_get_access_ids]: <Can List Access Ids Bool>
    [is_ok_to_get_chain_transactions]: <Can See Chain Transactions Bool>
    [is_ok_to_get_invoices]: <Can See Invoices Bool>
    [is_ok_to_get_wallet_info]: <Can General Graph and Wallet Information Bool>
    [is_ok_to_get_payments]: <Can Get Historical Lightning Transactions Bool>
    [is_ok_to_get_peers]: <Can Get Node Peers Information Bool>
    [is_ok_to_pay]: <Can Send Funds or Edit Lightning Payments Bool>
    [is_ok_to_revoke_access_ids]: <Can Revoke Access Ids Bool>
    [is_ok_to_send_to_chain_addresses]: <Can Send Coins On Chain Bool>
    [is_ok_to_sign_bytes]: <Can Sign Bytes From Node Keys Bool>
    [is_ok_to_sign_messages]: <Can Sign Messages From Node Key Bool>
    [is_ok_to_stop_daemon]: <Can Terminate Node or Change Operation Mode Bool>
    [is_ok_to_verify_bytes_signatures]: <Can Verify Signatures of Bytes Bool>
    [is_ok_to_verify_messages]: <Can Verify Messages From Node Keys Bool>
    lnd: <Authenticated LND API Object>
    [methods]: [<Method Name String>]
    [permissions]: [<Entity:Action String>]
  }

  @returns via cbk or Promise
  {
    macaroon: <Base64 Encoded Macaroon String>
    permissions: [<Entity:Action String>]
  }
*/
module.exports = (args, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!keys(args).length) {
          return cbk([400, 'ExpectedAccessPrivilegeToGrantAccessCredential']);
        }

        if (!isLnd({method, type, lnd: args.lnd})) {
          return cbk([400, 'ExpectedLndToGrantAccessCredential']);
        }

        return cbk();
      },

      // Derive URI permissions
      uris: ['validate', ({}, cbk) => {
        try {
          const uris = (args.methods || []).map(method => {
            return urisForMethod({method}).uris;
          });

          const permissions = uniq(flatten(uris)).map(uriAsPermission);

          return cbk(null, permissions);
        } catch (err) {
          return cbk([400, err.message]);
        }
      }],

      // Permissions to grant
      permissions: ['uris', ({uris}, cbk) => {
        const access = []
          .concat(uris)
          .concat(keys(permissions).filter(n => !!args[permissions[n]]))
          .concat(args.permissions || []);

        return cbk(null, access.map(permission => {
          const [entity, action] = permission.split(permissionSeparator);

          return {action, entity};
        }));
      }],

      // Make macaroon
      createMacaroon: ['permissions', ({permissions}, cbk) => {
        return args.lnd[type][method]({
          permissions,
          root_key_id: args.id || undefined,
        },
        (err, res) => {
          if (!!err && err.details === notSupported) {
            return cbk([501, 'GrantAccessMethodNotSupported']);
          }

          if (!!err && err.details === accessDenied) {
            return cbk([403, 'PermissionDeniedToBakeMacaroon']);
          }

          if (!!err) {
            return cbk([503, 'UnexpectedErrorFromBakeMacaroon', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedResponseFromBakeMacaroonRequest']);
          }

          if (!isHex(res.macaroon)) {
            return cbk([503, 'ExpectedHexSerializedMacaroonCredentials']);
          }

          const actions = permissions.map(n => `${n.entity}:${n.action}`);
          const macaroon = hexAsBase64(res.macaroon);

          return cbk(null, {macaroon, permissions: actions});
        });
      }],
    },
    returnResult({reject, resolve, of: 'createMacaroon'}, cbk));
  });
};
