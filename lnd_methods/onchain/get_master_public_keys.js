const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const {isArray} = Array;
const method = 'listAccounts';
const notSupported = /unknown.*walletrpc.WalletKit/;
const type = 'wallet';

/** Get the currently tracked master public keys

  Requires LND compiled with `walletrpc` build tag

  Requires `onchain:read` permission

  This method is not supported in LND 0.13.3 and below

  {
    lnd: <Authenticated API LND Object>
  }

  @returns via cbk or Promise
  {
    keys: [{
      derivation_path: <Key Derivation Path String>
      extended_public_key: <Base58 Encoded Master Public Key String>
      external_key_count: <Used External Keys Count Number>
      internal_key_count: <Used Internal Keys Count Number>
      is_watch_only: <Node has Master Private Key Bool>
      named: <Account Name String>
    }]
  }
*/
module.exports = ({lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedAuthenticatedLndToGetMasterPublicKeys']);
        }

        return cbk();
      },

      // Get master public keys
      getKeys: ['validate', ({}, cbk) => {
        return lnd[type][method]({}, (err, res) => {
          if (!!err && notSupported.test(err.details)) {
            return cbk([501, 'GetMasterPublicKeysMethodNotSupported']);
          }

          if (!!err) {
            return cbk([503, 'UnexpectedErrorGettingMasterPublicKeys', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedResultForMasterPublicKeyListRequest']);
          }

          if (!isArray(res.accounts)) {
            return cbk([503, 'ExpectedArrayOfAccountsInMasterPublicKeysList']);
          }

          const keys = res.accounts
            .filter(account => !!account.extended_public_key)
            .map(account => ({
              derivation_path: account.derivation_path,
              extended_public_key: account.extended_public_key,
              external_key_count: account.external_key_count,
              internal_key_count: account.internal_key_count,
              is_watch_only: account.watch_only,
              named: account.name,
            }));

          return cbk(null, {keys});
        });
      }],
    },
    returnResult({reject, resolve, of: 'getKeys'}, cbk));
  });
};
