const EventEmitter = require('events');
const {randomBytes} = require('crypto');

const asyncAuto = require('async/auto');
const asyncMapSeries = require('async/mapSeries');
const {chanFormat} = require('bolt07');
const {chanNumber} = require('bolt07');
const nextTick = require('async/nextTick');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');
const {paymentFailure} = require('./../../lnd_responses');
const routeFailureKeys = require('./../offchain/route_failure_keys');
const {rpcRouteFromRoute} = require('./../../lnd_requests');

const msAsISO = ms => new Date(ms).toISOString();
const {isArray} = Array;
const isHash = n => /^[0-9A-F]{64}$/i.test(n);
const hexAsBytes = hex => Buffer.from(hex, 'hex');
const method = 'sendToRouteV2';
const notFoundIndex = -1;
const {now} = Date;
const nsAsMs = ns => Number(BigInt(ns) / BigInt(1e6));
const payHashLength = Buffer.alloc(32).length;
const timeoutError = 'payment attempt not completed before timeout';
const unknownWireError = 'unknown wire error';

/** Subscribe to the attempts of paying via specified routes

  Requires `offchain:write` permission

  {
    [id]: <Payment Hash Hex String>
    lnd: <Authenticated LND API Object>
    [pathfinding_timeout]: <Time to Spend Finding a Route Milliseconds Number>
    routes: [{
      fee: <Total Fee Tokens To Pay Number>
      fee_mtokens: <Total Fee Millitokens To Pay String>
      hops: [{
        channel: <Standard Format Channel Id String>
        channel_capacity: <Channel Capacity Tokens Number>
        fee: <Fee Number>
        fee_mtokens: <Fee Millitokens String>
        forward: <Forward Tokens Number>
        forward_mtokens: <Forward Millitokens String>
        [messages]: [{
          type: <Message Type Number String>
          value: <Message Raw Value Hex Encoded String>
        }]
        public_key: <Public Key Hex String>
        timeout: <Timeout Block Height Number>
      }]
      [messages]: [{
        type: <Message Type Number String>
        value: <Message Raw Value Hex Encoded String>
      }]
      mtokens: <Total Millitokens To Pay String>
      [payment]: <Payment Identifier Hex String>
      timeout: <Expiration Block Height Number>
      tokens: <Total Tokens To Pay Number>
      [total_mtokens]: <Total Millitokens String>
    }]
  }

  @throws
  <Error>

  @returns
  <EventEmitter Object>

  @event 'failure'
  {
    failure: [
      <Code Number>
      <Failure Message String>
      {
        channel: <Standard Format Channel Id String>
        [index]: <Failure Hop Index Number>
        [mtokens]: <Millitokens String>
        [policy]: {
          base_fee_mtokens: <Base Fee Millitokens String>
          cltv_delta: <Locktime Delta Number>
          fee_rate: <Fees Charged in Millitokens Per Million Number>
          [is_disabled]: <Channel is Disabled Bool>
          max_htlc_mtokens: <Maximum HLTC Millitokens value String>
          min_htlc_mtokens: <Minimum HTLC Millitokens Value String>
        }
        public_key: <Public Key Hex String>
        [update]: {
          chain: <Chain Id Hex String>
          channel_flags: <Channel Flags Number>
          extra_opaque_data: <Extra Opaque Data Hex String>
          message_flags: <Message Flags Number>
          signature: <Channel Update Signature Hex String>
        }
      }
    ]
  }

  @event 'paying'
  {
    route: {
      fee: <Total Fee Tokens To Pay Number>
      fee_mtokens: <Total Fee Millitokens To Pay String>
      hops: [{
        channel: <Standard Format Channel Id String>
        channel_capacity: <Channel Capacity Tokens Number>
        fee: <Fee Number>
        fee_mtokens: <Fee Millitokens String>
        forward: <Forward Tokens Number>
        forward_mtokens: <Forward Millitokens String>
        public_key: <Public Key Hex String>
        timeout: <Timeout Block Height Number>
      }]
      mtokens: <Total Millitokens To Pay String>
      timeout: <Expiration Block Height Number>
      tokens: <Total Tokens To Pay Number>
    }
  }

  @event 'routing_failure'
  {
    [channel]: <Standard Format Channel Id String>
    [height]: <Failure Height Context Number>
    [index]: <Failure Hop Index Number>
    [mtokens]: <Failure Related Millitokens String>
    [policy]: {
      base_fee_mtokens: <Base Fee Millitokens String>
      cltv_delta: <Locktime Delta Number>
      fee_rate: <Fees Charged in Millitokens Per Million Number>
      [is_disabled]: <Channel is Disabled Bool>
      max_htlc_mtokens: <Maximum HLTC Millitokens value String>
      min_htlc_mtokens: <Minimum HTLC Millitokens Value String>
    }
    public_key: <Public Key Hex String>
    reason: <Failure Reason String>
    route: {
      fee: <Total Fee Tokens To Pay Number>
      fee_mtokens: <Total Fee Millitokens To Pay String>
      hops: [{
        channel: <Standard Format Channel Id String>
        channel_capacity: <Channel Capacity Tokens Number>
        fee: <Fee Number>
        fee_mtokens: <Fee Millitokens String>
        forward: <Forward Tokens Number>
        forward_mtokens: <Forward Millitokens String>
        public_key: <Public Key Hex String>
        timeout: <Timeout Block Height Number>
      }]
      mtokens: <Total Millitokens To Pay String>
      safe_fee: <Payment Forwarding Fee Rounded Up Tokens Number>
      safe_tokens: <Payment Tokens Rounded Up Number>
      timeout: <Expiration Block Height Number>
      tokens: <Total Tokens To Pay Number>
    }
    [timeout_height]: <Failure Related CLTV Timeout Height Number>
    [update]: {
      chain: <Chain Id Hex String>
      channel_flags: <Channel Flags Number>
      extra_opaque_data: <Extra Opaque Data Hex String>
      message_flags: <Message Flags Number>
      signature: <Channel Update Signature Hex String>
    }
  }

  @event 'success'
  {
    fee: <Fee Paid Tokens Number>
    fee_mtokens: <Fee Paid Millitokens String>
    hops: [{
      channel: <Standard Format Channel Id String>
      channel_capacity: <Hop Channel Capacity Tokens Number>
      fee_mtokens: <Hop Forward Fee Millitokens String>
      forward_mtokens: <Hop Forwarded Millitokens String>
      timeout: <Hop CLTV Expiry Block Height Number>
    }]
    id: <Payment Hash Hex String>
    is_confirmed: <Is Confirmed Bool>
    is_outgoing: <Is Outoing Bool>
    mtokens: <Total Millitokens Sent String>
    route: {
      fee: <Total Fee Tokens To Pay Number>
      fee_mtokens: <Total Fee Millitokens To Pay String>
      hops: [{
        channel: <Standard Format Channel Id String>
        channel_capacity: <Channel Capacity Tokens Number>
        fee: <Fee Number>
        fee_mtokens: <Fee Millitokens String>
        forward: <Forward Tokens Number>
        forward_mtokens: <Forward Millitokens String>
        public_key: <Public Key Hex String>
        timeout: <Timeout Block Height Number>
      }]
      mtokens: <Total Millitokens To Pay String>
      safe_fee: <Payment Forwarding Fee Rounded Up Tokens Number>
      safe_tokens: <Payment Tokens Rounded Up Number>
      timeout: <Expiration Block Height Number>
      tokens: <Total Tokens To Pay Number>
    }
    safe_fee: <Payment Forwarding Fee Rounded Up Tokens Number>
    safe_tokens: <Payment Tokens Rounded Up Number>
    secret: <Payment Secret Preimage Hex String>
    tokens: <Total Tokens Sent Number>
  }
*/
module.exports = args => {
  if (!!args.id && !isHash(args.id)) {
    throw new Error('ExpectedPaymentHashToPayViaRoutes');
  }

  if (!isLnd({method, lnd: args.lnd, type: 'router'})) {
    throw new Error('ExpectedAuthenticatedLndToPayViaRoutes');
  }

  if (!isArray(args.routes) || !args.routes.length) {
    throw new Error('ExpectedArrayOfPaymentRoutesToPayViaRoutes');
  }

  const id = args.id || randomBytes(payHashLength).toString('hex');

  if (!!args.routes.find(n => !isArray(n.hops))) {
    throw new Error('ExpectedRouteHopsToPayViaRoutes');
  }

  if (!!args.routes.find(n => n.hops.find(hop => !hop.public_key))) {
    throw new Error('ExpectedPublicKeyInPayViaRouteHops');
  }

  try {
    args.routes.forEach(({hops}) => {
      return hops.forEach(({channel}) => chanNumber({channel}));
    });
  } catch (err) {
    throw new Error('ExpectedValidRouteChannelIdsForPayViaRoutes');
  }

  const emitter = new EventEmitter();
  let isPayDone = false;
  const pathfindingTimeout = args.pathfinding_timeout;
  let payFailed = null;
  let payResult = null;
  const start = now();

  asyncMapSeries(args.routes, (route, cbk) => {
    // Exit early without trying a payment when there is a definitive result
    if (!!isPayDone) {
      return nextTick(cbk);
    }

    if (!!pathfindingTimeout && now() - start > pathfindingTimeout) {
      return cbk([503, 'PathfindingTimeoutExceeded']);
    }

    return asyncAuto({
      // Wait for subscription pick up
      waitForSubscribers: cbk => nextTick(cbk),

      // Try paying
      attempt: ['waitForSubscribers', ({}, cbk) => {
        emitter.emit('paying', {route});

        return args.lnd.router[method]({
          payment_hash: Buffer.from(id, 'hex'),
          route: rpcRouteFromRoute(route),
        },
        (err, res) => {
          if (!!err && err.details === unknownWireError) {
            return cbk(null, {});
          }

          if (!!err && err.details === timeoutError) {
            return cbk(null, {});
          }

          if (!!err) {
            return cbk([503, 'UnexpectedErrorWhenPayingViaRoute', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedResponseFromLndWhenPayingViaRoute']);
          }

          const confAt = !!res.preimage ? res.resolve_time_ns : undefined;

          return cbk(null, {
            confirmed_at: !!confAt ? msAsISO(nsAsMs(confAt)) : undefined,
            failure: res.failure,
            preimage: res.preimage,
          });
        });
      }],

      // Public keys associated with a failure
      keys: ['attempt', ({attempt}, cbk) => {
        const {keys} = routeFailureKeys({route, failure: attempt.failure});

        return cbk(null, keys);
      }],

      // Attempt to clean up failed probe state
      deleteProbe: ['attempt', ({attempt}, cbk) => {
        // Exit early when the payment didn't fail
        if (!attempt.failure) {
          return cbk();
        }

        // Exit early when this is a real payment
        if (!!args.id) {
          return cbk();
        }

        args.lnd.default.deletePayment({
          payment_hash: hexAsBytes(id),
        },
        err => {
          // Ignore errors trying to clean up probe data
          return cbk();
        });
      }],

      // Parsed out failure
      failure: ['attempt', 'keys', ({attempt, keys}, cbk) => {
        if (!attempt.failure) {
          return cbk();
        }

        const {failure} = attempt;

        const {channel} = (route.hops[failure.failure_source_index] || {});
        const from = route.hops[failure.failure_source_index - 1] || {};

        return cbk(null, paymentFailure({
          channel,
          failure,
          keys,
          key: from.public_key,
          index: failure.failure_source_index,
        }));
      }],

      // Attempt success
      success: ['attempt', ({attempt}, cbk) => {
        if (!!attempt.failure || !attempt.preimage) {
          return cbk();
        }

        if (!Buffer.isBuffer(attempt.preimage)) {
          return cbk([503, 'UnexpectedResultWhenPayingViaSendToRouteSync']);
        }

        isPayDone = true;

        return cbk(null, {
          confirmed_at: attempt.confirmed_at,
          fee: route.fee,
          fee_mtokens: route.fee_mtokens,
          hops: route.hops,
          mtokens: route.mtokens,
          safe_fee: route.safe_fee,
          safe_tokens: route.safe_tokens,
          secret: attempt.preimage.toString('hex'),
          tokens: route.tokens,
        });
      }],

      // Set pay result and pay error
      result: ['failure', 'success', ({failure, success}, cbk) => {
        // Exit early when there was no result of the pay attempt
        if (!failure && !success) {
          return cbk();
        }

        // A routing failure was encountered
        if (!!failure && !!failure.details) {
          isPayDone = failure.details.index === route.hops.length;

          emitter.emit('routing_failure', {
            route,
            channel: failure.details.channel,
            height: failure.details.height,
            index: failure.details.index,
            mtokens: failure.details.mtokens,
            policy: failure.details.policy,
            public_key: failure.details.public_key,
            reason: failure.message,
            timeout_height: failure.details.timeout_height,
            update: failure.details.update,
          });
        }

        // A failure instance has been received for this route
        if (!!failure) {
          payFailed = failure;

          emitter.emit('failure', {
            failure: [failure.code, failure.message, failure.details],
          });

          return cbk();
        }

        payResult = success;

        emitter.emit('success', {
          id,
          route,
          confirmed_at: success.confirmed_at,
          fee: success.fee,
          fee_mtokens: success.fee_mtokens,
          hops: success.hops,
          mtokens: success.mtokens,
          safe_fee: success.safe_fee,
          safe_tokens: success.safe_tokens,
          secret: success.secret,
          tokens: success.tokens,
        });

        return cbk();
      }],
    },
    returnResult({}, cbk));
  },
  err => {
    if (!!err && !!emitter.listenerCount('error')) {
      emitter.emit('error', err);
    }

    return emitter.emit('end');
  });

  return emitter;
};
