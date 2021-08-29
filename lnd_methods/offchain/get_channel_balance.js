const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const method = 'channelBalance';
const type = 'default';

/** Get balance across channels.

  Requires `offchain:read` permission

  `channel_balance_mtokens` is not supported on LND 0.11.1 and below

  `inbound` and `inbound_mtokens` are not supported on LND 0.11.1 and below

  `pending_inbound` is not supported on LND 0.11.1 and below

  `unsettled_balance` is not supported on LND 0.11.1 and below

  `unsettled_balance_mtokens` is not supported on LND 0.11.1 and below

  {
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
  {
    channel_balance: <Channels Balance Tokens Number>
    [channel_balance_mtokens]: <Channels Balance Millitokens String>
    [inbound]: <Inbound Liquidity Tokens Number>
    [inbound_mtokens]: <Inbound Liquidity Millitokens String>
    pending_balance: <Pending On-Chain Channels Balance Tokens Number>
    [pending_inbound]: <Pending On-Chain Inbound Liquidity Tokens Number>
    [unsettled_balance]: <In-Flight Tokens Number>
    [unsettled_balance_mtokens]: <In-Flight Millitokens String>
  }
*/
module.exports = ({lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedLndGrpcApiForChannelBalanceQuery']);
        }

        return cbk();
      },

      // Get channel balance summary
      getSummary: ['validate', ({}, cbk) => {
        return lnd[type][method]({}, (err, res) => {
          if (!!err) {
            return cbk([503, 'UnexpectedGetChannelBalanceError', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedGetChannelBalanceResponse']);
          }

          if (res.balance === undefined) {
            return cbk([503, 'ExpectedChannelBalance']);
          }

          if (res.pending_open_balance === undefined) {
            return cbk([503, 'ExpectedPendingOpenBalance']);
          }

          return cbk(null, res);
        });
      }],

      // Derive balances
      balances: ['getSummary', ({getSummary}, cbk) => {
        // Exit early when there is no extended balance data
        if (!getSummary.local_balance) {
          return cbk(null, {
            channel_balance: Number(getSummary.balance),
            pending_balance: Number(getSummary.pending_open_balance),
          });
        }

        if (!getSummary.local_balance.msat) {
          return cbk([503, 'ExpectedLocalChannelBalanceMSatsInResponse']);
        }

        if (!getSummary.local_balance.sat) {
          return cbk([503, 'ExpectedLocalChannelBalanceSatsInResponse']);
        }

        // Check that pending open balance is present
        if (!getSummary.pending_open_local_balance) {
          return cbk([503, 'ExpectedPendingOpenChannelBalanceInResponse']);
        }

        if (!getSummary.pending_open_local_balance.msat) {
          return cbk([503, 'ExpectedPendingOpenBalanceMSatsInResponse']);
        }

        if (!getSummary.pending_open_local_balance.sat) {
          return cbk([503, 'ExpectedPendingOpenBalanceSatsInResponse']);
        }

        // Check that pending open remote balance is present
        if (!getSummary.pending_open_remote_balance) {
          return cbk([503, 'ExpectedPendingRemoteChannelBalanceInResponse']);
        }

        if (!getSummary.pending_open_remote_balance.msat) {
          return cbk([503, 'ExpectedPendingOpenRemoteBalanceMSatsInResponse']);
        }

        if (!getSummary.pending_open_remote_balance.sat) {
          return cbk([503, 'ExpectedPendingOpenRemoteBalanceSatsInResponse']);
        }

        // Check that the remote balance details are present
        if (!getSummary.remote_balance) {
          return cbk([503, 'ExpectedRemoteChannelBalanceInResponse']);
        }

        if (!getSummary.remote_balance.msat) {
          return cbk([503, 'ExpectedRemoteChannelBalanceMSatsInResponse']);
        }

        if (!getSummary.remote_balance.sat) {
          return cbk([503, 'ExpectedRemoteChannelBalanceSatsInResponse']);
        }

        // Check that unsettled balance details are present
        if (!getSummary.unsettled_local_balance) {
          return cbk([503, 'ExpectedUnsettledLocalChannelBalanceInResponse']);
        }

        if (!getSummary.unsettled_local_balance.msat) {
          return cbk([503, 'ExpectedUnsettledLocalBalanceMSatsInResponse']);
        }

        if (!getSummary.unsettled_local_balance.sat) {
          return cbk([503, 'ExpectedUnsettledLocalBalanceSatsInResponse']);
        }

        // Check that unsettled remote balance details are present
        if (!getSummary.unsettled_remote_balance) {
          return cbk([503, 'ExpectedUnsettledRemoteChannelBalanceInResponse']);
        }

        if (!getSummary.unsettled_remote_balance.msat) {
          return cbk([503, 'ExpectedUnsettledRemoteBalanceSatsInResponse']);
        }

        if (!getSummary.unsettled_remote_balance.sat) {
          return cbk([503, 'ExpectedUnsettledRemoteBalanceSatsInResponse']);
        }

        return cbk(null, {
          channel_balance: Number(getSummary.local_balance.sat),
          channel_balance_mtokens: getSummary.local_balance.msat,
          inbound: Number(getSummary.remote_balance.sat),
          inbound_mtokens: getSummary.remote_balance.msat,
          pending_balance: Number(getSummary.pending_open_local_balance.sat),
          pending_inbound: Number(getSummary.pending_open_remote_balance.sat),
          unsettled_balance: Number(getSummary.unsettled_local_balance.sat),
          unsettled_balance_mtokens: getSummary.unsettled_local_balance.msat,
        });
      }],
    },
    returnResult({reject, resolve, of: 'balances'}, cbk));
  });
};
