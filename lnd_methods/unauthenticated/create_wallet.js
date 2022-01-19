const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const bufferAsBase64 = buffer => buffer.toString('base64');
const {isBuffer} = Buffer;
const method = 'initWallet';
const type = 'unlocker';
const utf8AsBuf = utf8 => Buffer.from(utf8, 'utf8');

/** Create a wallet

  Requires unlocked lnd and unauthenticated LND API Object

  {
    lnd: <Unauthenticated LND API Object>
    [passphrase]: <AEZSeed Encryption Passphrase String>
    password: <Wallet Password String>
    seed: <Seed Mnemonic String>
  }

  @returns via cbk or Promise
  {
    macaroon: <Base64 Encoded Admin Macaroon String>
  }
*/
module.exports = ({lnd, passphrase, password, seed}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedLndForWalletCreation']);
        }

        if (!password) {
          return cbk([400, 'ExpectedWalletPasswordForWalletCreation']);
        }

        if (!seed) {
          return cbk([400, 'ExpectedSeedMnemonicForWalletCreation']);
        }

        return cbk();
      },

      // Create wallet
      createWallet: ['validate', ({}, cbk) => {
        return lnd[type][method]({
          aezeed_passphrase: !!passphrase ? utf8AsBuf(passphrase) : undefined,
          cipher_seed_mnemonic: seed.split(' '),
          wallet_password: utf8AsBuf(password),
        },
        (err, res) => {
          if (!!err) {
            return cbk([503, 'UnexpectedInitWalletError', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedResponseForInitWallet']);
          }

          if (!isBuffer(res.admin_macaroon)) {
            return cbk([503, 'ExpectedAdminMacaroonToCrateWallet']);
          }

          return cbk(null, bufferAsBase64(res.admin_macaroon));
        });
      }],
    },
    returnResult({reject, resolve}, cbk));
  });
};
