const asyncAuto = require('async/auto');
const asyncMap = require('async/map');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');
const {pendingAsPendingChannels} = require('./../../lnd_responses');
const {rpcChannelAsOldRpcChannel} = require('./../../lnd_responses');

const {isArray} = Array;
const method = 'pendingChannels';
const outpointSeparator = ':';
const type = 'default';

/** Get pending channels.

  Both is_closing and is_opening are returned as part of a channel because
  a channel may be opening, closing, or active.

  Requires `offchain:read` permission

  {
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
  {
    pending_channels: [{
      capacity: <Channel Capacity Tokens Number>
      [close_transaction_id]: <Channel Closing Transaction Id String>
      is_active: <Channel Is Active Bool>
      is_closing: <Channel Is Closing Bool>
      is_opening: <Channel Is Opening Bool>
      is_partner_initiated: <Channel Partner Initiated Channel Bool>
      is_timelocked: <Channel Local Funds Constrained by Timelock Script Bool>
      local_balance: <Channel Local Tokens Balance Number>
      local_reserve: <Channel Local Reserved Tokens Number>
      partner_public_key: <Channel Peer Public Key String>
      [pending_balance]: <Tokens Pending Recovery Number>
      [pending_payments]: [{
        is_incoming: <Payment Is Incoming Bool>
        timelock_height: <Payment Timelocked Until Height Number>
        tokens: <Payment Tokens Number>
        transaction_id: <Payment Transaction Id String>
        transaction_vout: <Payment Transaction Vout Number>
      }]
      received: <Tokens Received Number>
      [recovered_tokens]: <Tokens Recovered From Close Number>
      remote_balance: <Remote Tokens Balance Number>
      remote_reserve: <Channel Remote Reserved Tokens Number>
      sent: <Send Tokens Number>
      [timelock_blocks]: <Timelock Blocks Remaining Number>
      [timelock_expiration]: <Pending Tokens Block Height Timelock Number>
      [transaction_fee]: <Commit Transaction Fee Tokens Number>
      transaction_id: <Channel Funding Transaction Id String>
      transaction_vout: <Channel Funding Transaction Vout Number>
      [transaction_weight]: <Commit Transaction Weight Number>
    }]
  }
*/
module.exports = ({lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedLndForPendingChannelsRequest']);
        }

        return cbk();
      },

      // Get pending channels
      getPending: ['validate', ({}, cbk) => {
        return lnd[type][method]({}, (err, res) => {
          if (!!err) {
            return cbk([503, 'UnexpectedPendingChannelsErr', {err}]);
          }

          try {
            const pending = pendingAsPendingChannels(res).pending_channels;

            return cbk(null, {pending_channels: pending});
          } catch (err) {
            return cbk([503, err.message]);
          }
        });
      }],
    },
    returnResult({reject, resolve, of: 'getPending'}, cbk));
  });
};
