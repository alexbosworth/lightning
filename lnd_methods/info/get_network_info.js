const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');
const {rpcNetworkAsNetworkInfo} = require('./../../lnd_responses');

const method = 'getNetworkInfo';
const type = 'default';

/** Get network info

  Requires `info:read` permission

  {
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
  {
    average_channel_size: <Tokens Number>
    channel_count: <Channels Count Number>
    max_channel_size: <Tokens Number>
    median_channel_size: <Median Channel Tokens Number>
    min_channel_size: <Tokens Number>
    node_count: <Node Count Number>
    not_recently_updated_policy_count: <Channel Edge Count Number>
    total_capacity: <Total Capacity Number>
  }
*/
module.exports = ({lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedLndForNetworkInfoRequest']);
        }

        return cbk();
      },

      // Get network info
      getInfo: ['validate', ({}, cbk) => {
        return lnd[type][method]({}, (err, networkInfo) => {
          if (!!err) {
            return cbk([503, 'UnexpectedGetNetworkInfoError', {err}]);
          }

          try {
            return cbk(null, rpcNetworkAsNetworkInfo(networkInfo));
          } catch (err) {
            return cbk([503, err.message]);
          }
        });
      }],
    },
    returnResult({reject, resolve, of: 'getInfo'}, cbk));
  });
};
