const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

/** Get balance on the chain.

  {
    lnd: <Authenticated LND gRPC API Object>
  }

  @returns via cbk or Promise
  {
    chain_balance: <Confirmed Chain Balance Tokens Number>
  }
*/
module.exports = ({lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!lnd) {
          return cbk([400, 'ExpectedAuthenticatedLndToRetrieveChainBalance']);
        }

        return cbk();
      },

      // Get wallet chain balance
      getBalance: ['validate', ({}, cbk) => {
        return lnd.default.walletBalance({}, (err, res) => {
          if (!!err) {
            return cbk([503, 'UnexpectedErrorWhenGettingChainBalance', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedResponseForChainBalanceRequest']);
          }

          if (res.confirmed_balance === undefined) {
            return cbk([503, 'ExpectedConfirmedBalanceInBalanceResponse']);
          }

          return cbk(null, {
            chain_balance: Number(res.confirmed_balance),
          });
        });
      }],
    },
    returnResult({reject, resolve, of: 'getBalance'}, cbk));
  });
};
