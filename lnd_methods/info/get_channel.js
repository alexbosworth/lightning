const asyncAuto = require('async/auto');
const {chanNumber} = require('bolt07');
const {returnResult} = require('asyncjs-util');

const {channelEdgeAsChannel} = require('./../../lnd_responses');
const {isLnd} = require('./../../lnd_requests');

const edgeIsZombieErrorMessage = 'edge marked as zombie';
const edgeNotFoundErrorMessage = 'edge not found';
const method = 'getChanInfo';
const type = 'default';

/** Get graph information about a channel on the network

  Either channel `id` or a `transaction_id` and `transaction_vout` is required

  Requires `info:read` permission

  `inbound_base_discount_mtokens` is not supported on LND 0.17.5 and below

  `inbound_rate_discount` is not supported on LND 0.17.5 and below

  `transaction_id` is not supported on LND 0.18.0 and below

  `transaction_vout` is not supported on LND 0.18.0 and below

  {
    [id]: <Standard Format Channel Id String>
    lnd: <Authenticated LND API Object>
    [transaction_id]: <Funding Outpoint Transaction Id Hex String>
    [transaction_vout]: <Funding Outpoint Transaction Output Index Number>
  }

  @returns via cbk or Promise
  {
    capacity: <Maximum Tokens Number>
    id: <Standard Format Channel Id String>
    policies: [{
      [base_fee_mtokens]: <Base Fee Millitokens String>
      [cltv_delta]: <Locktime Delta Number>
      [fee_rate]: <Fees Charged in Millitokens Per Million Number>
      [inbound_base_discount_mtokens]: <Source Based Base Fee Reduction String>
      [inbound_rate_discount]: <Source Based Per Million Rate Reduction Number>
      [is_disabled]: <Channel Is Disabled Bool>
      [max_htlc_mtokens]: <Maximum HTLC Millitokens Value String>
      [min_htlc_mtokens]: <Minimum HTLC Millitokens Value String>
      public_key: <Node Public Key String>
      [updated_at]: <Edge Last Updated At ISO 8601 Date String>
    }]
    transaction_id: <Transaction Id Hex String>
    transaction_vout: <Transaction Output Index Number>
    [updated_at]: <Channel Last Updated At ISO 8601 Date String>
  }
*/
module.exports = (args, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!!args.id && !!args.transaction_id) {
          return cbk([400, 'ExpectedEitherChannelIdOrOutpointToGetChannel']);
        }

        if (!args.id && !args.transaction_id) {
          return cbk([400, 'ExpectedChannelIdOrFundingOutpointToGetChannel']);
        }

        if (!isLnd({lnd: args.lnd, method: 'getChanInfo', type: 'default'})) {
          return cbk([400, 'ExpectedLndToGetChannelDetails']);
        }

        if (!!args.transaction_id && args.transaction_vout === undefined) {
          return cbk([400, 'ExpectedChannelFundingOutputIndexToGetChannel']);
        }

        return cbk();
      },

      // Channel arguments
      request: ['validate', ({}, cbk) => {
        // Exit early when a channel id is specified
        if (!!args.id) {
          return cbk(null, {chan_id: chanNumber({channel: args.id}).number});
        }

        return cbk(null, {
          chan_point: `${args.transaction_id}:${args.transaction_vout}`,
        });
      }],

      // Get channel
      getChannel: ['request', ({request}, cbk) => {
        return args.lnd[type][method](request, (err, response) => {
          if (!!err && err.details === edgeIsZombieErrorMessage) {
            return cbk([404, 'FullChannelDetailsNotFound']);
          }

          if (!!err && err.details === edgeNotFoundErrorMessage) {
            return cbk([404, 'FullChannelDetailsNotFound']);
          }

          if (!!err) {
            return cbk([503, 'UnexpectedGetChannelInfoError', {err}]);
          }

          if (!response) {
            return cbk([503, 'ExpectedGetChannelResponse']);
          }

          try {
            return cbk(null, channelEdgeAsChannel(response));
          } catch (err) {
            return cbk([503, err.message]);
          }
        });
      }],
    },
    returnResult({reject, resolve, of: 'getChannel'}, cbk));
  });
};
