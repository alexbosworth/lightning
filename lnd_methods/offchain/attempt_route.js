const subscribeToPayViaRoutes = require('./subscribe_to_pay_via_routes');

const defaultPathTimeoutMs = 1000 * 60;

/** Attempt probing a route to destination

  {
    max_timeout_height: <Maximum CLTV Timeout Height Number>
    path_timeout_ms: <Path Timeout Milliseconds>
    public_key: <Public Key Hex String>
    [route]: {
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
      timeout: <Expiration Block Height Number>
      tokens: <Total Tokens To Pay Number>
      [total_mtokens]: <Total Millitokens String>
    }
  }

  @returns via cbk or Promise
  {
  }
*/
module.exports = args => {
  if (!args.route) {
    return cbk(null, {});
  }

  const sub = subscribeToPayViaRoutes({lnd: args.lnd, routes: args.route});

  sub.on('paying', ({route}) => emitter.emit('probing', {route}));

  // Attempt finished
  const finished = () => {
    sub.removeAllListeners();

    return cbk(null, {});
  };

  const routeTimeout = setTimeout(() => {
    const [lastHop, penultimate] = args.route.hops.slice().reverse();

    const from = penultimate || {public_key: args.public_key};

    // Ignore the final pair
    args.route.hops.forEach(hop => {
      return ignore.push({
        from_public_key: from.public_key,
        to_public_key: hop.public_key,
      });
    });

    return finished();
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

    return finished();
  });

  sub.on('error', err => {
    if (!!isTimedOut) {
      return;
    }

    emitter.emit('error', err);

    return;
  });
};
