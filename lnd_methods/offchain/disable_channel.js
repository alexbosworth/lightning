const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const action = 'DISABLE';
const internalByteOrderId = id => Buffer.from(id, 'hex').reverse();
const isHash = n => !!n && /^[0-9A-F]{64}$/i.test(n);
const isNumber = n => !isNaN(n);
const method = 'updateChanStatus';
const notSupported = /unknown/;
const type = 'router';

/** Mark a channel as temporarily disabled for outbound payments and forwards

  Note: this method is not supported in LND versions 0.12.1 and below

  Requires `offchain:write` permission

  {
    lnd: <Authenticated LND API Object>
    transaction_id: <Channel Funding Transaction Id Hex String>
    transaction_vout: <Channel Funding Transaction Output Index Number>
  }

  @returns via cbk or Promise
*/
module.exports = (args, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({method, type, lnd: args.lnd})) {
          return cbk([400, 'ExpectedAuthenticatedLndToDisableChannel']);
        }

        if (!isHash(args.transaction_id)) {
          return cbk([400, 'ExpectedChannelFundingTxIdToDisableChannel']);
        }

        if (!isNumber(args.transaction_vout)) {
          return cbk([400, 'ExpectedChannelFundingTxVoutToDisableChannel']);
        }

        return cbk();
      },

      // Update channel
      update: ['validate', ({}, cbk) => {
        return args.lnd[type][method]({
          action,
          chan_point: {
            funding_txid_bytes: internalByteOrderId(args.transaction_id),
            output_index: args.transaction_vout,
          },
        },
        err => {
          if (!!err && notSupported.test(err.details)) {
            return cbk([501, 'DisableChannelMethodNotSupported']);
          }

          if (!!err) {
            return cbk([503, 'UnexpectedErrorDisablingChannel', {err}]);
          }

          return cbk();
        });
      }],
    },
    returnResult({reject, resolve}, cbk));
  });
};
