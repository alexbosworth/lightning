const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const enableAuto = 'AUTO';
const enableForce = 'ENABLE';
const internalByteOrderId = id => Buffer.from(id, 'hex').reverse();
const isHash = n => !!n && /^[0-9A-F]{64}$/i.test(n);
const isNumber = n => !isNaN(n);
const method = 'updateChanStatus';
const notSupported = /unknown/;
const type = 'router';

/** Mark a channel as enabled for outbound payments and forwards

  Setting `is_force_enable` will prevent future automated disabling/enabling

  Note: this method is not supported in LND versions 0.12.1 and below

  Requires `offchain:write` permission

  {
    [is_force_enable]: <Force Channel Enabled Bool>
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
          return cbk([400, 'ExpectedAuthenticatedLndToEnableChannel']);
        }

        if (!isHash(args.transaction_id)) {
          return cbk([400, 'ExpectedChannelFundingTxIdToEnableChannel']);
        }

        if (!isNumber(args.transaction_vout)) {
          return cbk([400, 'ExpectedChannelFundingTxVoutToEnableChannel']);
        }

        return cbk();
      },

      // Force an update to the channel to set it as enabled
      force: ['validate', ({}, cbk) => {
        return args.lnd[type][method]({
          action: enableForce,
          chan_point: {
            funding_txid_bytes: internalByteOrderId(args.transaction_id),
            output_index: args.transaction_vout,
          },
        },
        err => {
          if (!!err && notSupported.test(err.details)) {
            return cbk([501, 'EnableChannelMethodNotSupported']);
          }

          if (!!err) {
            return cbk([503, 'UnexpectedErrorEnablingChannel', {err}]);
          }

          return cbk();
        });
      }],

      // Update channel to automatically set enable
      auto: ['force', ({}, cbk) => {
        // Exit early when forcing the channel to remain enabled
        if (!!args.is_force_enable) {
          return cbk();
        }

        return args.lnd[type][method]({
          action: enableAuto,
          chan_point: {
            funding_txid_bytes: internalByteOrderId(args.transaction_id),
            output_index: args.transaction_vout,
          },
        },
        err => {
          if (!!err) {
            return cbk([503, 'UnexpectedErrorSettingChanToAutoEnable', {err}]);
          }

          return cbk();
        });
      }],
    },
    returnResult({reject, resolve}, cbk));
  });
};
