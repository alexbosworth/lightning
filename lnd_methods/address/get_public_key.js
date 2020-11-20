const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const methodNextKey = 'deriveNextKey';
const methodIndexLookup = 'deriveKey';
const type = 'wallet';

/** Get a public key in the seed

  Omit a key index to cycle to the "next" key in the family

  Requires LND compiled with `walletrpc` build tag

  Requires `address:read` permission

  {
    family: <Key Family Number>
    [index]: <Key Index Number>
    lnd: <Authenticated API LND Object>
  }

  @returns via cbk or Promise
  {
    index: <Key Index Number>
    public_key: <Public Key Hex String>
  }
*/
module.exports = ({family, index, lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (family === undefined) {
          return cbk([400, 'ExpectedKeyFamilyToGetPublicKey']);
        }

        if (!isLnd({lnd, type, method: methodIndexLookup})) {
          return cbk([400, 'ExpectedWalletRpcLndToGetPublicKey']);
        }

        return cbk();
      },

      // Get public key
      getPublicKey: ['validate', ({}, cbk) => {
        const method = index === undefined ? methodNextKey : methodIndexLookup;

        return lnd[type][method]({
          key_family: family,
          key_index: index,
        },
        (err, res) => {
          if (!!err) {
            return cbk([503, 'UnexpectedErrGettingPublicKeyFromSeed', {err}]);
          }

          if (!res) {
            return cbk([503, 'UnexpectedResultInDerivePublicKeyResponse']);
          }

          if (!Buffer.isBuffer(res.raw_key_bytes)) {
            return cbk([503, 'ExpectedRawPubKeyBytesInDerivePubKeyResponse']);
          }

          if (!res.key_loc) {
            return cbk([503, 'ExpectedKeyLocatorInPublicKeyResponse']);
          }

          if (res.key_loc.key_index === undefined) {
            return cbk([503, 'ExpectedKeyIndexInPublicKeyResponse']);
          }

          return cbk(null, {
            index: res.key_loc.key_index,
            public_key: res.raw_key_bytes.toString('hex')
          });
        });
      }],
    },
    returnResult({reject, resolve, of: 'getPublicKey'}, cbk));
  });
};
