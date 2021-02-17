const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const invalidPasswordError = 'invalid passphrase for master public key';
const method = 'unlockWallet';
const type = 'unlocker';
const utf8AsBuffer = utf8 => Buffer.from(utf8, 'utf8');

/** Unlock the wallet

  {
    lnd: <Unauthenticated LND API Object>
    password: <Wallet Password String>
  }

  @returns via cbk or Promise
*/
module.exports = ({lnd, password}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedLndWhenUnlockingWallet']);
        }

        if (!password) {
          return cbk([400, 'ExpectedUnlockPassword']);
        }

        return cbk();
      },

      // Unlock
      unlock: ['validate', ({}, cbk) => {
        return lnd[type][method]({
          wallet_password: utf8AsBuffer(password),
        },
        err => {
          if (!!err && err.details === invalidPasswordError) {
            return cbk([401, 'InvalidWalletUnlockPassword']);
          }

          if (!!err) {
            return cbk([503, 'UnexpectedUnlockWalletErr', {err}]);
          }

          return cbk();
        });
      }],
    },
    returnResult({reject, resolve}, cbk));
  });
};
