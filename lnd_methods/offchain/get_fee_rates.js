const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');
const {rpcFeesAsChannelFees} = require('./../../lnd_responses');

const {isArray} = Array;
const method = 'feeReport';
const type = 'default';

/** Get a rundown on fees for channels

  Requires `offchain:read` permission

  {
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
  {
    channels: [{
      base_fee: <Base Flat Fee Tokens Rounded Up Number>
      base_fee_mtokens: <Base Flat Fee Millitokens String>
      fee_rate: <Fee Rate in Millitokens Per Million Number>
      id: <Standard Format Channel Id String>
      transaction_id: <Channel Funding Transaction Id Hex String>
      transaction_vout: <Funding Outpoint Output Index Number>
    }]
  }
*/
module.exports = ({lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedLndForFeeRatesRequest']);
        }

        return cbk();
      },

      // Query for fee rates report
      getFeeReport: ['validate', ({}, cbk) => {
        return lnd[type][method]({}, (err, res) => {
          if (!!err) {
            return cbk([503, 'GetFeeReportError', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedFeeReportResponse']);
          }

          if (!isArray(res.channel_fees)) {
            return cbk([503, 'UnexpectedFeeReportResponse', res]);
          }

          return cbk(null, res.channel_fees);
        });
      }],

      // Map fee report into fee rates and check response data
      feesForChannels: ['getFeeReport', ({getFeeReport}, cbk) => {
        try {
          const channels = getFeeReport.map(n => rpcFeesAsChannelFees(n));

          return cbk(null, {channels});
        } catch (err) {
          return cbk([503, err.message]);
        }
      }],
    },
    returnResult({reject, resolve, of: 'feesForChannels'}, cbk));
  });
};
