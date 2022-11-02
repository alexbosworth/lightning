const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const getPublicKey = require('./../address/get_public_key');
const {isLnd} = require('./../../lnd_requests');
const {rpcGroupSessionAsSession} = require('./../../lnd_responses');

const hexAsBuffer = hex => Buffer.from(hex, 'hex');
const {isArray} = Array;
const isHash = n => /^[0-9A-F]{64}$/i.test(n);
const method = 'muSig2CreateSession';
const type = 'signer';
const uniq = arr => Array.from(new Set(arr));
const unsupportedMessage = 'unknown method MuSig2CreateSession for service signrpc.Signer';
const xOnlyPublicKeyHexLength = 64;
const xOnlyPublicKey = hexKey => hexKey.slice(2);

/** Start a MuSig2 group signing session

  Requires LND built with `signrpc`, `walletrpc` build tags

  Requires `address:read`, `signer:generate` permissions

  This method is not supported in LND 0.14.5 and below

  {
    lnd: <Authenticated LND API Object>
    [is_key_spend]: <Key Is BIP 86 Key Spend Key Bool>
    key_family: <HD Seed Key Family Number>
    key_index: <Key Index Number>
    public_keys: [<External Public Key Hex String>]
    [root_hash]: <Taproot Script Root Hash Hex String>
  }

  @returns via cbk or Promise
  {
    external_key: <Final Script or Top Level Public Key Hex String>
    id: <Session Id Hex String>
    [internal_key]: <Internal Top Level Public Key Hex String>
    nonce: <Session Compound Nonces Hex String>
  }
*/
module.exports = (args, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({method, type, lnd: args.lnd})) {
          return cbk([400, 'ExpectedAuthenticatedLndToStartMuSig2Session']);
        }

        if (args.key_family === undefined) {
          return cbk([400, 'ExpectedKeyFamilyToStartMuSig2Session']);
        }

        if (args.key_index === undefined) {
          return cbk([400, 'ExpectedKeyIndexToStartMuSig2Session']);
        }

        if (!isArray(args.public_keys)) {
          return cbk([400, 'ExpectedArrayOfPublicKeysForMuSig2SessionStart']);
        }

        if (!args.public_keys.length) {
          return cbk([400, 'ExpectedOtherPublicKeysForMuSig2SessionStart']);
        }

        if (!!args.root_hash && !isHash(args.root_hash)) {
          return cbk([400, 'ExpectedHashWhenSpecifyingMuSig2ScriptRootHash']);
        }

        return cbk();
      },

      // Get the local public key to pass it to the session along with others
      getKey: ['validate', ({}, cbk) => {
        return getPublicKey({
          family: args.key_family,
          index: args.key_index,
          lnd: args.lnd,
        },
        cbk);
      }],

      // Put together the Taproot tweak flags for top level signing
      taprootTweak: ['validate', ({}, cbk) => {
        // Spend should include a top level Taproot script commitment proof
        if (!!args.root_hash) {
          return cbk(null, {script_root: hexAsBuffer(args.root_hash)});
        }

        // Spend is absent a Taproot script, but is a top-level Taproot key
        if (!!args.is_key_spend) {
          return cbk(null, {key_spend_only: true});
        }

        return cbk();
      }],

      // Collect all public keys taking part in the signing session
      publicKeys: ['getKey', ({getKey}, cbk) => {
        // Trim public keys as necessary
        const keys = [getKey.public_key].concat(args.public_keys).map(key => {
          if (key.length === xOnlyPublicKeyHexLength) {
            return key;
          }

          return xOnlyPublicKey(key);
        });

        return cbk(null, uniq(keys));
      }],

      // Create the signing session
      create: [
        'publicKeys',
        'taprootTweak',
        ({publicKeys, taprootTweak}, cbk) =>
      {
        return args.lnd[type][method]({
          all_signer_pubkeys: publicKeys.map(hexAsBuffer),
          key_loc: {key_family: args.key_family, key_index: args.key_index},
          taproot_tweak: taprootTweak,
        },
        (err, res) => {
          if (!!err && err.details === unsupportedMessage) {
            return cbk([501, 'MuSig2BeginSigningSessionNotSupported']);
          }

          if (!!err) {
            return cbk([503, 'UnexpectedErrorCreatingMuSig2Session', {err}]);
          }

          try {
            return cbk(null, rpcGroupSessionAsSession(res));
          } catch (err) {
            return cbk([503, err.message]);
          }
        });
      }],
    },
    returnResult({reject, resolve, of: 'create'}, cbk));
  });
};
