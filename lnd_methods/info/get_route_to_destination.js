const asyncAuto = require('async/auto');
const asyncRetry = require('async/retry');
const BN = require('bn.js');
const {chanNumber} = require('bolt07');
const {returnResult} = require('asyncjs-util');

const {blocksBuffer} = require('./constants');
const {defaultCltv} = require('./constants');
const {defaultTokens} = require('./constants');
const {destinationCustomRecords} = require('./../../lnd_requests');
const {getHeight} = require('./../generic');
const {ignoreAsIgnoredNodes} = require('./../../lnd_requests');
const {ignoreAsIgnoredPairs} = require('./../../lnd_requests');
const {isLnd} = require('./../../lnd_requests');
const {mtokensAmount} = require('./../../bolt00');
const {pathNotFoundErrors} = require('./constants');
const {routeHintFromRoute} = require('./../../lnd_requests');
const {routesFromQueryRoutes} = require('./../../lnd_responses');

const asTimePreference = n => n === undefined ? n : ((n * 2) - 1e6) / 1e6;
const bufFromHex = hex => !hex ? null : Buffer.from(hex, 'hex');
const {concat} = Buffer;
const defaultRetryInterval = retryCount => 50 * Math.pow(2, retryCount);
const defaultMaxFee = Number.MAX_SAFE_INTEGER;
const errorFilter = err => Array.isArray(err) && err.slice().shift() === 429;
const internalServerError = /internal.server.error/i;
const {isArray} = Array;
const isConfidence = n => !isNaN(n) && n >= 0 && n <= 1e6;
const isHex = n => !(n.length % 2) && /^[0-9A-F]*$/i.test(n);
const mtokensByteLength = 8;
const networkBusyError = /device.or.resource.busy/;
const noRouteErrorDetails = 'unable to find a path to destination';
const paymentFromMppRecord = n => n.value.slice(0, 64);
const paymentTooLargeError = /is.too.large/;
const targetNotFoundError = 'target not found';
const defaultRetryTimes = 9;
const tokensAsMtokens = n => (BigInt(n) * BigInt(1e3)).toString();
const trimByte = 0;

/** Get a route to a destination.

  Call this iteratively after failed route attempts to get new routes

  Requires `info:read` permission

  Preferred `confidence` is not supported on LND 0.14.5 and below

  {
    [cltv_delta]: <Final CLTV Delta Number>
    [confidence]: <Preferred Route Confidence Number Out of One Million Number>
    destination: <Final Send Destination Hex Encoded Public Key String>
    [features]: [{
      bit: <Feature Bit Number>
    }]
    [ignore]: [{
      from_public_key: <Public Key Hex String>
      [to_public_key]: <To Public Key Hex String>
    }]
    [incoming_peer]: <Incoming Peer Public Key Hex String>
    [is_ignoring_past_failures]: <Ignore Past Failures Bool>
    lnd: <Authenticated LND API Object>
    [max_fee]: <Maximum Fee Tokens Number>
    [max_fee_mtokens]: <Maximum Fee Millitokens String>
    [max_timeout_height]: <Max CLTV Timeout Number>
    [messages]: [{
      type: <Message To Final Destination Type Number String>
      value: <Message To Final Destination Raw Value Hex Encoded String>
    }]
    [mtokens]: <Tokens to Send String>
    [outgoing_channel]: <Outgoing Channel Id String>
    [payment]: <Payment Identifier Hex Strimng>
    [routes]: [[{
      [base_fee_mtokens]: <Base Routing Fee In Millitokens String>
      [channel]: <Standard Format Channel Id String>
      [channel_capacity]: <Channel Capacity Tokens Number>
      [cltv_delta]: <CLTV Delta Blocks Number>
      [fee_rate]: <Fee Rate In Millitokens Per Million Number>
      public_key: <Forward Edge Public Key Hex String>
    }]]
    [start]: <Starting Node Public Key Hex String>
    [tokens]: <Tokens Number>
    [total_mtokens]: <Total Millitokens of Shards String>
  }

  @returns via cbk or Promise
  {
    [route]: {
      [confidence]: <Route Confidence Score Out Of One Million Number>
      fee: <Route Fee Tokens Number>
      fee_mtokens: <Route Fee Millitokens String>
      hops: [{
        channel: <Standard Format Channel Id String>
        channel_capacity: <Channel Capacity Tokens Number>
        fee: <Fee Number>
        fee_mtokens: <Fee Millitokens String>
        forward: <Forward Tokens Number>
        forward_mtokens: <Forward Millitokens String>
        public_key: <Forward Edge Public Key Hex String>
        timeout: <Timeout Block Height Number>
      }]
      [messages]: [{
        type: <Message Type Number String>
        value: <Message Raw Value Hex Encoded String>
      }]
      mtokens: <Total Fee-Inclusive Millitokens String>
      [payment]: <Payment Identifier Hex String>
      safe_fee: <Payment Forwarding Fee Rounded Up Tokens Number>
      safe_tokens: <Payment Tokens Rounded Up Number>
      timeout: <Route Timeout Height Number>
      tokens: <Total Fee-Inclusive Tokens Number>
      [total_mtokens]: <Total Millitokens String>
    }
  }
*/
module.exports = (args, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (args.confidence !== undefined && !isConfidence(args.confidence)) {
          return cbk([400, 'ExpectedConfidenceInPartsPerMillionForQuery']);
        }

        if (!args.destination || !isHex(args.destination)) {
          return cbk([400, 'ExpectedDestinationKeyToGetRouteToDestination']);
        }

        if (!isLnd({lnd: args.lnd, method: 'queryRoutes', type: 'default'})) {
          return cbk([400, 'ExpectedLndApiObjectToGetRouteToDestination']);
        }

        if (!!args.outgoing_channel) {
          try {
            chanNumber({channel: args.outgoing_channel});
          } catch (err) {
            return cbk([400, 'ExpectedStandardFormatChannelIdForOutChannel']);
          }
        }

        if (!!args.total_mtokens && !args.payment) {
          return cbk([400, 'ExpectedTotalMtokensWithPaymentIdentifier']);
        }

        return cbk();
      },

      // Derive the amount in millitokens
      amountMillitokens: ['validate', ({}, cbk) => {
        try {
          const {mtokens} = mtokensAmount({
            mtokens: args.mtokens,
            tokens: args.tokens,
          });

          return cbk(null, mtokens || tokensAsMtokens(defaultTokens));
        } catch (err) {
          return cbk([400, err.message]);
        }
      }],

      // Get destination messages
      destinationCustomRecords: ['validate', ({}, cbk) => {
        const {tlv} = destinationCustomRecords({
          messages: args.messages,
          payment: args.payment,
          total_mtokens: args.total_mtokens,
        });

        return cbk(null, tlv);
      }],

      // Final hop expected features
      destinationFeatures: ['validate', ({}, cbk) => {
        // Exit early when there are no features specified
        if (!args.features) {
          return cbk();
        }

        return cbk(null, args.features.map(({bit}) => bit));
      }],

      // Determine the fee limit
      feeLimitMillitokens: ['validate', ({}, cbk) => {
        try {
          const {mtokens} = mtokensAmount({
            mtokens: args.max_fee_mtokens,
            tokens: args.max_fee,
          });

          return cbk(null, mtokens || tokensAsMtokens(defaultMaxFee));
        } catch (err) {
          return cbk([400, err.message]);
        }
      }],

      // Get the current height to adjust timeout height to a delta
      getHeight: ['validate', ({}, cbk) => {
        // Exit early when there is no max height specified
        if (!args.max_timeout_height) {
          return cbk();
        }

        return getHeight({lnd: args.lnd}, cbk);
      }],

      // Determine the outgoing channel
      outgoingChannel: ['validate', ({}, cbk) => {
        // Exit early when there is no outgoing channel constraint
        if (!args.outgoing_channel) {
          return cbk();
        }

        return cbk(null, chanNumber({channel: args.outgoing_channel}).number);
      }],

      // Derive hop hints in RPC format
      routeHints: ['validate', ({}, cbk) => {
        // Exit early when there are no route hints
        if (!args.routes || !args.routes.length) {
          return cbk();
        }

        const hints = args.routes.map(route => {
          return {hop_hints: routeHintFromRoute({route}).hops}
        });

        return cbk(null, hints);
      }],

      // Derive the CLTV limit
      cltvLimit: ['getHeight', ({getHeight}, cbk) => {
        // Exit early when there is no wallet info
        if (!getHeight) {
          return cbk();
        }

        const currentBlockHeight = getHeight.current_block_height;

        return cbk(null, args.max_timeout_height - currentBlockHeight);
      }],

      // Execute find route query
      query: [
        'amountMillitokens',
        'cltvLimit',
        'destinationCustomRecords',
        'destinationFeatures',
        'feeLimitMillitokens',
        'outgoingChannel',
        'routeHints',
        ({
          amountMillitokens,
          destinationCustomRecords,
          destinationFeatures,
          feeLimitMillitokens,
          cltvLimit,
          outgoingChannel,
          routeHints,
        },
        cbk) =>
      {
        const {ignore} = args;
        const interval = defaultRetryInterval;
        const times = defaultRetryTimes;

        return asyncRetry({interval, times, errorFilter}, cbk => {
          return args.lnd.default.queryRoutes({
            amt_msat: amountMillitokens,
            cltv_limit: cltvLimit,
            dest_custom_records: destinationCustomRecords,
            dest_features: destinationFeatures || undefined,
            fee_limit: {fixed_msat: feeLimitMillitokens},
            final_cltv_delta: (args.cltv_delta || defaultCltv) + blocksBuffer,
            ignored_nodes: ignoreAsIgnoredNodes({ignore}).ignored || undefined,
            ignored_pairs: ignoreAsIgnoredPairs({ignore}).ignored || undefined,
            last_hop_pubkey: bufFromHex(args.incoming_peer) || undefined,
            outgoing_chan_id: outgoingChannel || undefined,
            pub_key: args.destination,
            route_hints: routeHints || undefined,
            source_pub_key: args.start || undefined,
            time_pref: asTimePreference(args.confidence),
            use_mission_control: !args.is_ignoring_past_failures,
          },
          (err, response) => {
            // Exit early when an error indicates that no routes are possible
            if (!!err && err.details === noRouteErrorDetails) {
              return cbk(null, {response: {routes: []}});
            }

            if (!!err && err.details === targetNotFoundError) {
              return cbk([503, 'TargetNotFoundError']);
            }

            if (!!err && paymentTooLargeError.test(err.details)) {
              return cbk([400, 'PaymentTooLargeToFindRoute', {err}]);
            }

            if (!!err && networkBusyError.test(err.details)) {
              return cbk([429, 'TooManyRequestsToGetRouteToDestination']);
            }

            if (!!err && internalServerError.test(err.details)) {
              return cbk([429, 'InternalServerErrorExecutingQueryRoutes']);
            }

            if (!!err) {
              return cbk([503, 'UnexpectedErrInGetRouteToDestination', {err}]);
            }

            if (!response) {
              return cbk([503, 'ExpectedResponseFromQueryRoutes']);
            }

            if (!isArray(response.routes)) {
              return cbk([503, 'ExpectedRoutesArrayFromQueryRoutes']);
            }

            return cbk(null, {response});
          });
        },
        cbk);
      }],

      // Derived routes from query routes response
      routes: ['query', ({query}, cbk) => {
        // Exit early when there are no routes
        if (!query.response.routes.length) {
          return cbk(null, query.response.routes);
        }

        try {
          const {routes} = routesFromQueryRoutes({response: query.response});

          return cbk(null, routes);
        } catch (err) {
          return cbk([503, 'UnexpectedResultFromQueryRoutes', {err}]);
        }
      }],

      // Final route result
      route: ['routes', ({routes}, cbk) => {
        const [route] = routes;

        // Exit early when there is no route to the destination
        if (!route) {
          return cbk(null, {});
        }

        route.payment = args.payment;
        route.total_mtokens = args.total_mtokens;

        return cbk(null, {route});
      }],
    },
    returnResult({reject, resolve, of: 'route'}, cbk));
  });
};
