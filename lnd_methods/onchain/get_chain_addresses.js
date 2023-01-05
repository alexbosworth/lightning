const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');
const {rpcAddressesAsAddresses} = require('./../../lnd_responses');

const err404 = 'unknown method ListAddresses for service walletrpc.WalletKit';
const {isArray} = Array;
const method = 'listAddresses';
const type = 'wallet';
const unsupportedErrorMessage = 'unknown service walletrpc.WalletKit';

/** Get the wallet chain addresses

  Requires `onchain:read` permission

  This method is not supported on LND 0.15.5 and below

  {
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
  {
    addresses: [{
      address: <Chain Address String>
      is_change: <Is Internal Change Address Bool>
      tokens: <Balance of Funds Controlled by Output Script Tokens Number>
    }]
  }
*/
module.exports = ({lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedAuthenticatedLndToGetChainAddresses']);
        }

        return cbk();
      },

      // Get the list of accounts with addresses
      getAddresses: ['validate', ({}, cbk) => {
        return lnd[type][method]({}, (err, res) => {
          // LND 0.15.5 and below do not support listing account addresses
          if (!!err && err.details === err404) {
            return cbk([501, 'BackingLndDoesNotSupportGettingChainAddresses']);
          }

          if (!!err) {
            return cbk([503, 'UnexpectedErrorListingAccountAddresses', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedResponseForGetAccountAddressesRequest']);
          }

          if (!isArray(res.account_with_addresses)) {
            return cbk([503, 'ExpectedSetOfAccountAddressesInAddrsResponse']);
          }

          return cbk(null, res.account_with_addresses);
        });
      }],

      // Map the accounts to a list of addresses
      addresses: ['getAddresses', ({getAddresses}, cbk) => {
        try {
          const {addresses} = rpcAddressesAsAddresses({
            accounts: getAddresses,
          });

          return cbk(null, {addresses});
        } catch (err) {
          return cbk([503, err.message]);
        }
      }],
    },
    returnResult({reject, resolve, of: 'addresses'}, cbk));
  });
};
