const {deepStrictEqual} = require('node:assert').strict;
const EventEmitter = require('node:events');
const test = require('node:test');
const {throws} = require('node:assert').strict;

const {getInfoResponse} = require('./../fixtures');
const {queryRoutesResponse} = require('./../fixtures');
const {subscribeToProbeForRoute} = require('./../../../');

const deletePayment = ({}, cbk) => cbk();

const expectedRoute = {
  confidence: 1000000,
  fee: 0,
  fee_mtokens: '1',
  hops: [{
    channel: '0x0x1',
    fee: 0,
    fee_mtokens: '1',
    forward: 0,
    forward_mtokens: '1',
    public_key: '00',
    timeout: 1,
  }],
  messages: [],
  mtokens: '1',
  payment: undefined,
  safe_fee: 1,
  safe_tokens: 1,
  timeout: 1,
  tokens: 0,
  total_mtokens: undefined,
};

const sendToRouteFailure = {
  chan_id: '1',
  code: 'INCORRECT_OR_UNKNOWN_PAYMENT_DETAILS',
  failure_source_index: 1,
};

const blindedKey = `03${'02'.repeat(32)}`;
const introductionNode = `02${'01'.repeat(32)}`;
const otherIntroductionNode = `02${'05'.repeat(32)}`;
const pathKey = `02${'03'.repeat(32)}`;
const relayKey = `02${'04'.repeat(32)}`;

const makePath = overrides => {
  const path = {
    base_fee_mtokens: '10',
    cltv_delta: 40,
    fee_rate: 1000,
    hops: [
      {encrypted_data: '01', relay_key: introductionNode},
      {encrypted_data: '02', relay_key: blindedKey},
    ],
    introduction_node: introductionNode,
    key: pathKey,
    max_htlc_mtokens: '100000',
    min_htlc_mtokens: '1',
  };

  Object.keys(overrides || {}).forEach(k => path[k] = overrides[k]);

  return path;
};

// The probe route to the introduction node as returned by query routes
const introductionRoute = {
  confidence: 1000000,
  fee: 0,
  fee_mtokens: '0',
  hops: [{
    channel: '0x0x1',
    fee: 0,
    fee_mtokens: '0',
    forward: 1,
    forward_mtokens: '1011',
    public_key: introductionNode,
    timeout: 100,
  }],
  messages: [],
  mtokens: '1011',
  payment: undefined,
  safe_fee: 0,
  safe_tokens: 2,
  timeout: 100,
  tokens: 1,
  total_mtokens: undefined,
};

// A two hop route in query routes format
const twoHopRpcRoute = {
  hops: [
    {
      amt_to_forward_msat: '1',
      chan_id: '1',
      custom_records: {},
      expiry: 1,
      fee_msat: '1',
      pub_key: relayKey,
    },
    {
      amt_to_forward_msat: '1',
      chan_id: '2',
      custom_records: {},
      expiry: 1,
      fee_msat: '0',
      pub_key: introductionNode,
    },
  ],
  total_amt: '1',
  total_amt_msat: '2',
  total_fees: '1',
  total_fees_msat: '1',
  total_time_lock: 1,
};

// The two hop route as returned by the probe
const twoHopRoute = {
  confidence: 1000000,
  fee: 0,
  fee_mtokens: '1',
  hops: [
    {
      channel: '0x0x1',
      fee: 0,
      fee_mtokens: '1',
      forward: 0,
      forward_mtokens: '1',
      public_key: relayKey,
      timeout: 1,
    },
    {
      channel: '0x0x2',
      fee: 0,
      fee_mtokens: '0',
      forward: 0,
      forward_mtokens: '1',
      public_key: introductionNode,
      timeout: 1,
    },
  ],
  messages: [],
  mtokens: '2',
  payment: undefined,
  safe_fee: 1,
  safe_tokens: 1,
  timeout: 1,
  tokens: 0,
  total_mtokens: undefined,
};

// The probe route continued into the blinded path
const blindedRoute = {
  confidence: 1000000,
  fee: 0,
  fee_mtokens: '11',
  hops: [
    {
      channel: '0x0x1',
      encrypted_data: '01',
      fee: 0,
      fee_mtokens: '11',
      forward: 0,
      forward_mtokens: '0',
      path_key: pathKey,
      public_key: introductionNode,
      timeout: 0,
    },
    {
      channel: '0x0x0',
      encrypted_data: '02',
      fee: 0,
      fee_mtokens: '0',
      forward: 1,
      forward_mtokens: '1000',
      public_key: blindedKey,
      timeout: 60,
    },
  ],
  mtokens: '1011',
  safe_fee: 1,
  safe_tokens: 2,
  timeout: 100,
  tokens: 1,
  total_mtokens: undefined,
};

// Make an LND that has a route to the introduction node
const makeBlindedLnd = ({missing, routes}) => {
  const requests = [];

  const lnd = {
    default: {
      deletePayment,
      getInfo: ({}, cbk) => cbk(null, getInfoResponse),
      queryRoutes: (args, cbk) => {
        requests.push(args);

        // Exit early when the destination is not in the graph
        if ((missing || []).includes(args.pub_key)) {
          return cbk({details: 'target not found'});
        }

        // Exit early when there is no route to this destination
        if (!routes[args.pub_key]) {
          return cbk(null, {routes: []});
        }

        return cbk(null, {routes: [routes[args.pub_key]], success_prob: 1});
      },
    },
    requests,
    router: {
      sendToRouteV2: ({route}, cbk) => cbk(null, {
        failure: {
          chan_id: '1',
          code: 'INCORRECT_OR_UNKNOWN_PAYMENT_DETAILS',
          failure_source_index: route.hops.length,
        },
        preimage: Buffer.alloc(Number()),
      }),
    },
  };

  return lnd;
};

const introductionRpcRoute = {
  hops: [{
    amt_to_forward_msat: '1011',
    chan_id: '1',
    custom_records: {},
    expiry: 100,
    fee_msat: '0',
    pub_key: introductionNode,
  }],
  total_amt: '1',
  total_amt_msat: '1011',
  total_fees: '0',
  total_fees_msat: '0',
  total_time_lock: 100,
};

// The introduction route with a timeout that cannot cover a blinded path
const shortTimeoutRpcRoute = Object.assign({}, introductionRpcRoute, {
  hops: [Object.assign({}, introductionRpcRoute.hops[0], {expiry: 1})],
});

const makeLnd = ({count, getInfo, response, sendToRouteV2}) => {
  let returnedRoutes = 0;

  const defaultSendTo = ({}, cbk) => cbk(null, {});
  const requests = [];

  const lnd = {
    default: {
      deletePayment,
      getInfo: getInfo || (({}, cbk) => cbk(null, getInfoResponse)),
      queryRoutes: (args, cbk) => {
        requests.push(args);

        if (returnedRoutes === (count || 1)) {
          return cbk(null, {routes: []});
        }

        returnedRoutes++;

        return cbk(null, response || queryRoutesResponse);
      },
    },
    requests,
    router: {
      sendToRouteV2: sendToRouteV2 || defaultSendTo,
    },
  };

  return lnd;
};

const tests = [
  {
    args: {},
    description: 'A destination public key is required',
    error: 'ExpectedDestinationPublicKeyToSubscribeToProbe',
  },
  {
    args: {paths: 'paths'},
    description: 'When paths are specified, an array is expected',
    error: 'ExpectedArrayOfBlindedPathsToSubscribeToProbe',
  },
  {
    args: {paths: [makePath({key: undefined})]},
    description: 'When paths are specified, valid paths are expected',
    error: 'ExpectedValidBlindedPathsToSubscribeToProbe',
  },
  {
    args: {messages: [{type: '1', value: '00'}], paths: [makePath({})]},
    description: 'Messages cannot be delivered into a blinded path',
    error: 'ExpectedNoMessagesToProbeToBlindedPaths',
  },
  {
    args: {paths: [makePath({})], payment: Buffer.alloc(32).toString('hex')},
    description: 'A payment identifier is not used with a blinded path',
    error: 'ExpectedNoPaymentIdentifierToProbeToBlindedPaths',
  },
  {
    args: {paths: [makePath({})], routes: [[{public_key: introductionNode}]]},
    description: 'Route hints are not used with a blinded path',
    error: 'ExpectedNoRouteHintsToProbeToBlindedPaths',
  },
  {
    args: {
      lnd: makeBlindedLnd({routes: {}}),
      paths: [makePath({min_htlc_mtokens: '2000'})],
      tokens: 1,
    },
    description: 'A blinded path must allow the amount to probe',
    error: 'ExpectedBlindedPathAllowingAmountToProbe',
  },
  {
    args: {destination: Buffer.alloc(33).toString('hex'), ignore: 'ignore'},
    description: 'When ignore is specified, an array is expected',
    error: 'ExpectedIgnoreEdgesArrayInProbeSubscription',
  },
  {
    args: {destination: Buffer.alloc(33).toString('hex')},
    description: 'LND is expected to probe',
    error: 'ExpectedRouterRpcToSubscribeToProbe',
  },
  {
    args: {
      destination: Buffer.alloc(33).toString('hex'),
      lnd: {router: {sendToRouteV2: ({}, cbk) => cbk()}},
    },
    description: 'A token amount is required to subscribe to a probe',
    error: 'ExpectedTokenAmountToSubscribeToProbe',
  },
  {
    args: {
      destination: Buffer.alloc(33).toString('hex'),
      ignore: [{from_public_key: 'from', to_public_key: 'to'}],
      lnd: makeLnd({}),
      probe_timeout_ms: 1,
      tokens: 1,
    },
    description: 'A probe tries a route',
    expected: {failures: [], routes: [expectedRoute]},
  },
  {
    args: {
      destination: Buffer.alloc(33).toString('hex'),
      lnd: makeLnd({getInfo: ({}, cbk) => cbk('err')}),
      tokens: 1,
    },
    description: 'A probe encounters an error getting info',
    expected: {
      error: [503, 'GetWalletInfoErr', {err: 'err'}],
      failures: [],
      routes: [],
    },
  },
  {
    args: {
      destination: Buffer.alloc(33).toString('hex'),
      lnd: makeLnd({getInfo: ({}, cbk) => cbk('err')}),
      suppress_errors: true,
      tokens: 1,
    },
    description: 'Non-listening errors are not emitted',
    expected: {
      failures: [],
      routes: [],
    },
  },
  {
    args: {
      destination: Buffer.alloc(33).toString('hex'),
      lnd: makeLnd({
        sendToRouteV2: ({}, cbk) => setTimeout(() => cbk('e'), 20),
      }),
      probe_timeout_ms: 1,
      tokens: 1,
    },
    description: 'A probe times out',
    expected: {
      error: [503, 'ProbeTimeout'],
      failures: [],
      routes: [expectedRoute],
    },
  },
  {
    args: {
      destination: Buffer.alloc(33).toString('hex'),
      lnd: makeLnd({sendToRouteV2: ({}, cbk) => cbk('err')}),
      tokens: 1,
    },
    description: 'A probe hits an error paying a route',
    expected: {
      error: [503, 'UnexpectedErrorWhenPayingViaRoute', {err: 'err'}],
      failures: [],
      routes: [expectedRoute],
    },
  },
  {
    args: {
      destination: Buffer.alloc(33).toString('hex'),
      lnd: makeLnd({
        sendToRouteV2: ({}, cbk) => cbk(null, {
          failure: {
            chan_id: '1',
            code: 'UNKNOWN_FAILURE',
            failure_source_index: 1,
          },
          preimage: Buffer.alloc(Number()),
        }),
      }),
      tokens: 1,
    },
    description: 'A probe is successful',
    expected: {
      failures: [],
      routes: [expectedRoute],
      success: expectedRoute,
    },
  },
  {
    args: {
      destination: Buffer.alloc(33).toString('hex'),
      lnd: makeLnd({
        sendToRouteV2: ({}, cbk) => cbk(null, {
          failure: {
            chan_id: '1',
            code: 'UNKNOWN_FAILURE',
            failure_source_index: 0,
          },
          preimage: Buffer.alloc(Number()),
        }),
      }),
      tokens: 1,
    },
    description: 'A probe hits a routing failure',
    expected: {
      failures: [{
        channel: '0x0x1',
        index: 0,
        mtokens: undefined,
        policy: undefined,
        public_key: undefined,
        reason: 'UnknownFailure',
        route: expectedRoute,
        update: undefined,
      }],
      routes: [expectedRoute],
    },
  },
  {
    args: {
      destination: Buffer.alloc(33).toString('hex'),
      lnd: makeLnd({
        sendToRouteV2: ({}, cbk) => {
          return setTimeout(() => {
            return cbk(null, {
              failure: {
                chan_id: '1',
                code: 'UNKNOWN_FAILURE',
                failure_source_index: 0,
              },
              preimage: Buffer.alloc(Number()),
            });
          },
          50);
        },
      }),
      probe_timeout_ms: 1,
      tokens: 1,
    },
    description: 'A probe hits a routing failure',
    expected: {
      error: [503, 'ProbeTimeout'],
      failures: [],
      routes: [expectedRoute],
    },
  },
  {
    args: {
      destination: Buffer.alloc(33).toString('hex'),
      lnd: makeLnd({
        count: 2,
        sendToRouteV2: ({}, cbk) => {
          return setTimeout(() => {
            return cbk(null, {
              failure: {
                chan_id: '1',
                code: 'UNKNOWN_FAILURE',
                failure_source_index: 0,
              },
              preimage: Buffer.alloc(Number()),
            });
          },
          50);
        },
      }),
      path_timeout_ms: 1,
      probe_timeout_ms: 1,
      tokens: 1,
    },
    description: 'A probe times out and tries something else',
    expected: {
      error: [503, 'ProbeTimeout'],
      failures: [],
      routes: [expectedRoute],
    },
  },
  {
    args: {
      lnd: makeBlindedLnd({routes: {[introductionNode]: introductionRpcRoute}}),
      paths: [makePath({})],
      tokens: 1,
    },
    description: 'A probe to a blinded path finds a route into the path',
    expected: {
      failures: [],
      requests: [{
        amt_msat: '1011',
        dest_features: undefined,
        final_cltv_delta: 46,
        pub_key: introductionNode,
      }],
      routes: [introductionRoute],
      success: blindedRoute,
    },
  },
  {
    args: {
      lnd: makeBlindedLnd({routes: {[introductionNode]: introductionRpcRoute}}),
      paths: [makePath({})],
      tokens: 1,
      total_mtokens: '2000',
    },
    description: 'A probe to a blinded path includes the total millitokens',
    expected: {
      failures: [],
      requests: [{
        amt_msat: '1011',
        dest_features: undefined,
        final_cltv_delta: 46,
        pub_key: introductionNode,
      }],
      routes: [introductionRoute],
      success: Object.assign({}, blindedRoute, {total_mtokens: '2000'}),
    },
  },
  {
    args: {
      lnd: makeBlindedLnd({routes: {[introductionNode]: introductionRpcRoute}}),
      max_fee_mtokens: '10',
      paths: [makePath({})],
      tokens: 1,
    },
    description: 'A blinded path with fees above the max fee is not probed',
    expected: {failures: [], requests: [], routes: []},
  },
  {
    args: {
      lnd: makeBlindedLnd({routes: {[introductionNode]: introductionRpcRoute}}),
      max_fee_mtokens: '11',
      paths: [makePath({})],
      tokens: 1,
    },
    description: 'A blinded path fee is deducted from the max fee',
    expected: {
      failures: [],
      requests: [{
        amt_msat: '1011',
        dest_features: undefined,
        fee_limit: {fixed_msat: '0'},
        final_cltv_delta: 46,
        pub_key: introductionNode,
      }],
      routes: [introductionRoute],
      success: blindedRoute,
    },
  },
  {
    args: {
      lnd: makeBlindedLnd({routes: {[introductionNode]: introductionRpcRoute}}),
      paths: [
        makePath({
          hops: [
            {encrypted_data: '03', relay_key: otherIntroductionNode},
            {encrypted_data: '04', relay_key: blindedKey},
          ],
          introduction_node: otherIntroductionNode,
        }),
        makePath({}),
      ],
      tokens: 1,
    },
    description: 'A probe tries the next blinded path when one has no route',
    expected: {
      failures: [],
      requests: [
        {
          amt_msat: '1011',
          dest_features: undefined,
          final_cltv_delta: 46,
          pub_key: otherIntroductionNode,
        },
        {
          amt_msat: '1011',
          dest_features: undefined,
          final_cltv_delta: 46,
          pub_key: introductionNode,
        },
      ],
      routes: [introductionRoute],
      success: blindedRoute,
    },
  },
  {
    args: {
      lnd: makeBlindedLnd({
        missing: [otherIntroductionNode],
        routes: {[introductionNode]: introductionRpcRoute},
      }),
      paths: [
        makePath({
          hops: [
            {encrypted_data: '03', relay_key: otherIntroductionNode},
            {encrypted_data: '04', relay_key: blindedKey},
          ],
          introduction_node: otherIntroductionNode,
        }),
        makePath({}),
      ],
      tokens: 1,
    },
    description: 'A probe tries the next path when an introduction is unknown',
    expected: {
      failures: [],
      requests: [
        {
          amt_msat: '1011',
          dest_features: undefined,
          final_cltv_delta: 46,
          pub_key: otherIntroductionNode,
        },
        {
          amt_msat: '1011',
          dest_features: undefined,
          final_cltv_delta: 46,
          pub_key: introductionNode,
        },
      ],
      routes: [introductionRoute],
      success: blindedRoute,
    },
  },
  {
    args: {
      lnd: makeBlindedLnd({routes: {[introductionNode]: introductionRpcRoute}}),
      paths: [
        makePath({
          hops: [{encrypted_data: '01', relay_key: introductionNode}],
        }),
      ],
      mtokens: '1011',
    },
    description: 'A probe to a single hop blinded path has no path fee',
    expected: {
      failures: [],
      requests: [{
        amt_msat: '1011',
        dest_features: undefined,
        final_cltv_delta: 46,
        pub_key: introductionNode,
      }],
      routes: [introductionRoute],
      success: {
        confidence: 1000000,
        fee: 0,
        fee_mtokens: '0',
        hops: [{
          channel: '0x0x1',
          encrypted_data: '01',
          fee: 0,
          fee_mtokens: '0',
          forward: 1,
          forward_mtokens: '1011',
          path_key: pathKey,
          public_key: introductionNode,
          timeout: 100,
        }],
        mtokens: '1011',
        safe_fee: 0,
        safe_tokens: 2,
        timeout: 100,
        tokens: 1,
        total_mtokens: undefined,
      },
    },
  },
  {
    args: {
      destination: Buffer.alloc(33).toString('hex'),
      lnd: makeLnd({
        response: {routes: [twoHopRpcRoute], success_prob: 1},
        sendToRouteV2: ({}, cbk) => cbk(null, {
          failure: {
            chan_id: '2',
            code: 'TEMPORARY_CHANNEL_FAILURE',
            failure_source_index: 1,
          },
          preimage: Buffer.alloc(Number()),
        }),
      }),
      tokens: 1,
    },
    description: 'A temporary channel failure pair is ignored on later routes',
    expected: {
      failures: [{
        channel: '0x0x2',
        index: 1,
        mtokens: undefined,
        policy: undefined,
        public_key: undefined,
        reason: 'TemporaryChannelFailure',
        route: twoHopRoute,
        update: undefined,
      }],
      ignored: [[], [{
        from: Buffer.from(relayKey, 'hex'),
        to: Buffer.from(introductionNode, 'hex'),
      }]],
      routes: [twoHopRoute],
    },
  },
  {
    args: {
      lnd: makeBlindedLnd({routes: {[introductionNode]: shortTimeoutRpcRoute}}),
      paths: [makePath({})],
      tokens: 1,
    },
    description: 'A route that cannot be extended into a path is an error',
    expected: {
      error: [
        503,
        'FailedToExtendRouteIntoBlindedPath',
        {err: new Error('ExpectedRouteTimeoutToCoverBlindedPathCltvDelta')},
      ],
      failures: [],
      routes: [Object.assign({}, introductionRoute, {
        hops: [Object.assign({}, introductionRoute.hops[0], {timeout: 1})],
      })],
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, (t, end) => {
    if (!!error) {
      throws(() => subscribeToProbeForRoute(args), new Error(error), 'Error');

      return end();
    } else {
      const failures = [];
      let gotError;
      const routes = [];
      let gotSuccess;
      const sub = subscribeToProbeForRoute(args);

      sub.on('error', err => gotError = err);
      sub.on('probe_success', ({route}) => gotSuccess = route);
      sub.on('probing', ({route}) => routes.push(route));
      sub.on('routing_failure', failure => failures.push(failure));

      if (!!args.suppress_errors) {
        sub.removeAllListeners('error');
      }

      sub.on('end', () => {
        deepStrictEqual(failures, expected.failures, 'Got expected failures');
        deepStrictEqual(gotError, expected.error, 'Got expected error');
        deepStrictEqual(gotSuccess, expected.success, 'Got expected success');
        deepStrictEqual(routes, expected.routes, 'Got expected routes');

        // Check the ignored pairs of route queries when they are expected
        if (!!expected.ignored) {
          const ignored = args.lnd.requests.map(request => {
            return (request.ignored_pairs || []).map(pair => ({
              from: pair.from,
              to: pair.to,
            }));
          });

          deepStrictEqual(ignored, expected.ignored, 'Got expected ignores');
        }

        // Check the route queries that were made when they are expected
        if (!!expected.requests) {
          const requests = args.lnd.requests.map(request => {
            const query = {
              amt_msat: request.amt_msat,
              dest_features: request.dest_features,
              final_cltv_delta: request.final_cltv_delta,
              pub_key: request.pub_key,
            };

            if (!!expected.requests.find(n => !!n.fee_limit)) {
              query.fee_limit = request.fee_limit;
            }

            return query;
          });

          deepStrictEqual(requests, expected.requests, 'Got expected queries');
        }

        return end();
      });
    }
  });
});
