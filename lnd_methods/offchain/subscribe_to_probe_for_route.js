const EventEmitter = require('events');

const asyncAuto = require('async/auto');
const asyncWhilst = require('async/whilst');

const {getRouteToDestination} = require('./../info');
const {getIdentity} = require('./../info');
const {isLnd} = require('./../../lnd_requests');
const {mtokensAmount} = require('./../../bolt00');
const subscribeToPayViaRoutes = require('./subscribe_to_pay_via_routes');

const defaultPathTimeoutMs = 1000 * 60;
const defaultProbeTimeoutMs = 1000 * 60 * 60 * 24;
const {isArray} = Array;
const isIgnoreFailure = reason => reason === 'TemporaryChannelFailure';
const isPublicKey = n => /^[0-9A-F]{66}$/i.test(n);
const {nextTick} = process;

/** Subscribe to a probe attempt

  Requires `offchain:write` permission

  Preferred `confidence` is not supported on LND 0.14.5 and below

  {
    [cltv_delta]: <Final CLTV Delta Number>
    [confidence]: <Preferred Route Confidence Number Out of One Million Number>
    destination: <Destination Public Key Hex String>
    [features]: [{
      bit: <Feature Bit Number>
    }]
    [ignore]: [{
      from_public_key: <Public Key Hex String>
      [to_public_key]: <To Public Key Hex String>
    }]
    [incoming_peer]: <Incoming Peer Public Key Hex String>
    lnd: <Authenticated LND API Object>
    [max_fee]: <Maximum Fee Tokens Number>
    [max_fee_mtokens]: <Maximum Fee Millitokens to Probe String>
    [max_timeout_height]: <Maximum CLTV Timeout Height Number>
    [messages]: [{
      type: <Message To Final Destination Type Number String>
      value: <Message To Final Destination Raw Value Hex Encoded String>
    }]
    [mtokens]: <Millitokens to Probe String>
    [outgoing_channel]: <Outgoing Channel Id String>
    [path_timeout_ms]: <Skip Individual Path Attempt After Milliseconds Number>
    [payment]: <Payment Identifier Hex Strimng>
    [probe_timeout_ms]: <Fail Entire Probe After Milliseconds Number>
    [routes]: [[{
      [base_fee_mtokens]: <Base Routing Fee In Millitokens String>
      [channel_capacity]: <Channel Capacity Tokens Number>
      [channel]: <Standard Format Channel Id String>
      [cltv_delta]: <CLTV Blocks Delta Number>
      [fee_rate]: <Fee Rate In Millitokens Per Million Number>
      public_key: <Forward Edge Public Key Hex String>
    }]]
    [tokens]: <Tokens to Probe Number>
    [total_mtokens]: <Total Millitokens Across Paths String>
  }

  @returns
  <Probe Subscription Event Emitter Object>

  @event 'error'
  [<Failure Code Number>, <Failure Message String>]

  @event 'probe_success'
  {
    route: {
      [confidence]: <Route Confidence Score Out Of One Million Number>
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
      [messages]: [{
        type: <Message Type Number String>
        value: <Message Raw Value Hex Encoded String>
      }]
      mtokens: <Total Millitokens To Pay String>
      [payment]: <Payment Identifier Hex String>
      safe_fee: <Payment Forwarding Fee Rounded Up Tokens Number>
      safe_tokens: <Payment Sent Tokens Rounded Up Number>
      timeout: <Expiration Block Height Number>
      tokens: <Total Tokens To Pay Number>
      [total_mtokens]: <Total Millitokens String>
    }
  }

  @event 'probing'
  {
    route: {
      [confidence]: <Route Confidence Score Out Of One Million Number>
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
      [messages]: [{
        type: <Message Type Number String>
        value: <Message Raw Value Hex Encoded String>
      }]
      mtokens: <Total Millitokens To Pay String>
      [payment]: <Payment Identifier Hex String>
      safe_fee: <Payment Forwarding Fee Rounded Up Tokens Number>
      safe_tokens: <Payment Sent Tokens Rounded Up Number>
      timeout: <Expiration Block Height Number>
      tokens: <Total Tokens To Pay Number>
      [total_mtokens]: <Total Millitokens String>
    }
  }

  @event 'routing_failure'
  {
    [channel]: <Standard Format Channel Id String>
    index: <Failure Index Number>
    [mtokens]: <Millitokens String>
    [policy]: {
      base_fee_mtokens: <Base Fee Millitokens String>
      cltv_delta: <Locktime Delta Number>
      fee_rate: <Fees Charged in Millitokens Per Million Number>
      [is_disabled]: <Channel is Disabled Bool>
      max_htlc_mtokens: <Maximum HLTC Millitokens Value String>
      min_htlc_mtokens: <Minimum HTLC Millitokens Value String>
      [public_key]: <Public Key Hex String>
      [updated_at]: <Updated At ISO 8601 Date String>
    }
    [public_key]: <Public Key Hex String>
    reason: <Failure Reason String>
    route: {
      [confidence]: <Route Confidence Score Out Of One Million Number>
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
      [messages]: [{
        type: <Message Type Number String>
        value: <Message Raw Value Hex Encoded String>
      }]
      mtokens: <Total Millitokens To Pay String>
      [payment]: <Payment Identifier Hex String>
      safe_fee: <Payment Forwarding Fee Rounded Up Tokens Number>
      safe_tokens: <Payment Sent Tokens Rounded Up Number>
      timeout: <Expiration Block Height Number>
      tokens: <Total Tokens To Pay Number>
      [total_mtokens]: <Total Millitokens String>
    }
    [update]: {
      chain: <Chain Id Hex String>
      channel_flags: <Channel Flags Number>
      extra_opaque_data: <Extra Opaque Data Hex String>
      message_flags: <Message Flags Number>
      signature: <Channel Update Signature Hex String>
    }
  }
*/
module.exports = args => {
  if (!isPublicKey(args.destination)) {
    throw new Error('ExpectedDestinationPublicKeyToSubscribeToProbe');
  }

  if (!!args.ignore && !isArray(args.ignore)) {
    throw new Error('ExpectedIgnoreEdgesArrayInProbeSubscription');
  }

  if (!isLnd({lnd: args.lnd, method: 'sendToRouteV2', type: 'router'})) {
    throw new Error('ExpectedRouterRpcToSubscribeToProbe');
  }

  const {mtokens} = mtokensAmount({
    mtokens: args.mtokens,
    tokens: args.tokens,
  });

  if (!mtokens) {
    throw new Error('ExpectedTokenAmountToSubscribeToProbe');
  }

  const emitter = new EventEmitter();
  const ignore = [];
  let isFinal = false;
  let isTimedOut = false;
  const temporaryChannelFailures = [];

  if (!!args.ignore) {
    args.ignore.forEach(n => ignore.push({
      from_public_key: n.from_public_key,
      to_public_key: n.to_public_key,
    }));
  }

  const emitError = err => {
    if (!emitter.listenerCount('error')) {
      return;
    }

    return emitter.emit('error', err);
  };

  const probeTimeout = setTimeout(() => {
    isFinal = true;
    isTimedOut = true;

    emitError([503, 'ProbeTimeout']);

    emitter.emit('end');

    return;
  },
  args.probe_timeout_ms || defaultProbeTimeoutMs);

  asyncWhilst(
    cbk => nextTick(() => cbk(null, !isFinal)),
    cbk => {
      return asyncAuto({
        // Get public key
        getInfo: cbk => getIdentity({lnd: args.lnd}, cbk),

        // Get the next route
        getNextRoute: cbk => {
          return getRouteToDestination({
            mtokens,
            cltv_delta: args.cltv_delta,
            confidence: args.confidence,
            destination: args.destination,
            features: args.features,
            ignore: ignore.concat(temporaryChannelFailures),
            incoming_peer: args.incoming_peer,
            lnd: args.lnd,
            max_fee: args.max_fee,
            max_fee_mtokens: args.max_fee_mtokens,
            max_timeout_height: args.max_timeout_height,
            messages: args.messages,
            outgoing_channel: args.outgoing_channel,
            payment: args.payment,
            routes: args.routes,
            total_mtokens: args.total_mtokens,
          },
          cbk);
        },

        // Attempt paying the route
        attemptRoute: [
          'getNextRoute',
          'getInfo',
          ({getInfo, getNextRoute}, cbk) =>
        {
          const routes = [getNextRoute.route].filter(n => !!n);

          if (!routes.length) {
            return cbk(null, {});
          }

          let currentRoute;
          const sub = subscribeToPayViaRoutes({routes, lnd: args.lnd});

          sub.on('paying', ({route}) => {
            currentRoute = route;

            return emitter.emit('probing', {route});
          });

          const next = () => {
            sub.removeAllListeners();

            return cbk(null, {});
          };

          const routeTimeout = setTimeout(() => {
            const [lastHop, penultimate] = currentRoute.hops.slice().reverse();

            const from = penultimate || getInfo;

            // Ignore the final pair
            currentRoute.hops.forEach(hop => {
              return ignore.push({
                from_public_key: from.public_key,
                to_public_key: hop.public_key,
              });
            });

            return next();
          },
          args.path_timeout_ms || defaultPathTimeoutMs);

          sub.on('routing_failure', failure => {
            if (failure.index === failure.route.hops.length) {
              isFinal = true;
            }

            // Exit early when the probe timed out
            if (!!isTimedOut) {
              return;
            }

            // Exit early when the probe found a completed route
            if (!!isFinal) {
              return emitter.emit('probe_success', {route: failure.route});
            }

            if (!!failure.index && isIgnoreFailure(failure.reason)) {
              const from = failure.route.hops[failure.index - 1];
              const to = failure.route.hops[failure.index];

              temporaryChannelFailures.push({
                from_public_key: from.public_key,
                to_public_key: to.public_key,
              });
            }

            emitter.emit('routing_failure', {
              channel: failure.channel,
              index: failure.index,
              mtokens: failure.mtokens,
              policy: failure.policy || undefined,
              public_key: failure.public_key,
              reason: failure.reason,
              route: failure.route,
              update: failure.update,
            });

            return;
          });

          // Probing finished
          sub.on('end', () => {
            clearTimeout(routeTimeout);

            return next();
          });

          sub.on('error', err => {
            if (!!isTimedOut) {
              return;
            }

            return emitError(err);
          });

          return;
        }],
      },
      (err, res) => {
        if (!!err) {
          return cbk(err);
        }

        if (!!isFinal) {
          return cbk();
        }

        if (!res.getNextRoute.route) {
          isFinal = true;
        }

        return cbk();
      });
    },
    err => {
      // Exit early when the probe timed out
      if (!!isTimedOut) {
        return;
      }

      clearTimeout(probeTimeout);

      if (!!err) {
        emitError(err);
      }

      emitter.emit('end');

      return;
    },
  );

  return emitter;
};
