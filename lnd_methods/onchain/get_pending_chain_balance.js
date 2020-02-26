const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

/** Get pending chain balance in unconfirmed outputs and in channel limbo.

  {
    lnd: <Authenticated LND gRPC API Object>
  }

  @returns via cbk or Promise
  {
    pending_chain_balance: <Pending Chain Balance Tokens Number>
  }
*/
module.exports = ({lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({lnd, method: 'pendingChannels', type: 'default'})) {
          return cbk([400, 'ExpectedLndForPendingChainBalance']);
        }

        return cbk();
      },

      // Determine the balance that is still in timelocks
      channelsLimboBalance: ['validate', ({}, cbk) => {
        return lnd.default.pendingChannels({}, (err, res) => {
          if (!!err) {
            return cbk([503, 'GetPendingChannelsErr', {err}]);
          }

          if (!res || res.total_limbo_balance === undefined) {
            return cbk([503, 'ExpectedTotalLimboBalance']);
          }

          return cbk(null, Number(res.total_limbo_balance));
        });
      }],

      // Determine the balance that is in unconfirmed chain outputs
      unconfirmedChainBalance: ['validate', ({}, cbk) => {
        return lnd.default.walletBalance({}, (err, res) => {
          if (!!err) {
            return cbk([503, 'GetChainBalanceError', {err}]);
          }

          if (!res || res.unconfirmed_balance === undefined) {
            return cbk([503, 'ExpectedUnconfirmedBalance']);
          }

          return cbk(null, Number(res.unconfirmed_balance));
        });
      }],

      // Sum the chain balance with the timelocked balance
      pendingChainBalance: [
        'channelsLimboBalance',
        'unconfirmedChainBalance',
        ({channelsLimboBalance, unconfirmedChainBalance}, cbk) =>
      {
        const balance = channelsLimboBalance + unconfirmedChainBalance;

        return cbk(null, {pending_chain_balance: balance});
      }],
    },
    returnResult({reject, resolve, of: 'pendingChainBalance'}, cbk));
  });
};
