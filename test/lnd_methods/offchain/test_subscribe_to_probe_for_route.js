const {test} = require('@alexbosworth/tap');

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
    channel_capacity: 1,
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

const makeLnd = ({count, getInfo, sendToRouteV2}) => {
  let returnedRoutes = 0;

  const defaultSendTo = ({}, cbk) => cbk(null, {faillure: sendToRouteFailure});

  const lnd = {
    default: {
      deletePayment,
      getInfo: getInfo || (({}, cbk) => cbk(null, getInfoResponse)),
      queryRoutes: ({}, cbk) => {
        if (returnedRoutes === (count || 1)) {
          return cbk(null, {routes: []});
        }

        returnedRoutes++;

        return cbk(null, queryRoutesResponse);
      },
    },
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
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, ({end, equal, strictSame, throws}) => {
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
        strictSame(failures, expected.failures, 'Got expected failures');
        strictSame(gotError, expected.error, 'Got expected error');
        strictSame(gotSuccess, expected.success, 'Got expected success');
        strictSame(routes, expected.routes, 'Got expected routes');

        return end();
      });
    }
  });
});
