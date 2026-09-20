const {deepStrictEqual} = require('node:assert').strict;
const {rejects} = require('node:assert').strict;
const test = require('node:test');

const {getInfoResponse} = require('./../fixtures');
const {probeForRoute} = require('./../../../');
const {queryRoutesResponse} = require('./../fixtures');

const deletePayment = ({}, cbk) => cbk();
const destination = Buffer.alloc(33, 2).toString('hex');
const introductionNode = `02${'01'.repeat(32)}`;

const path = {
  base_fee_mtokens: '10',
  cltv_delta: 40,
  fee_rate: 1000,
  hops: [
    {encrypted_data: '01', relay_key: introductionNode},
    {encrypted_data: '02', relay_key: `03${'02'.repeat(32)}`},
  ],
  introduction_node: introductionNode,
  key: `02${'03'.repeat(32)}`,
};

// The route found to the probe destination
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

// A route to the introduction node of the blinded path in RPC format
const introductionResponse = {
  routes: [{
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
  }],
  success_prob: 1,
};

// Make an LND that returns a route once and then has a result for the probe
const makeLnd = ({response, sendToRouteV2}) => {
  let isRouteReturned = false;

  const lnd = {
    default: {
      deletePayment,
      getInfo: ({}, cbk) => cbk(null, getInfoResponse),
      queryRoutes: ({}, cbk) => {
        if (isRouteReturned) {
          return cbk(null, {routes: []});
        }

        isRouteReturned = true;

        return cbk(null, response || queryRoutesResponse);
      },
    },
    router: {sendToRouteV2},
  };

  return lnd;
};

// The probe reaches the final hop of the route
const reachDestination = ({route}, cbk) => cbk(null, {
  failure: {
    chan_id: '1',
    code: 'INCORRECT_OR_UNKNOWN_PAYMENT_DETAILS',
    failure_source_index: route.hops.length,
  },
  preimage: Buffer.alloc(Number()),
});

// The probe fails before the final hop of the route
const failEarly = ({}, cbk) => cbk(null, {
  failure: {
    chan_id: '1',
    code: 'UNKNOWN_FAILURE',
    failure_source_index: 0,
  },
  preimage: Buffer.alloc(Number()),
});

const tests = [
  {
    args: {},
    description: 'A destination is required to probe for a route',
    error: [400, 'ExpectedDestinationKeyHexStringForRouteProbe'],
  },
  {
    args: {paths: 'paths'},
    description: 'Paths must be an array when specified',
    error: [400, 'ExpectedArrayOfBlindedPathsToProbeForRoute'],
  },
  {
    args: {destination, ignore: 'ignore'},
    description: 'Ignore must be an array when specified',
    error: [400, 'ExpectedIgnoreAsArrayWhenProbingForRoute'],
  },
  {
    args: {destination},
    description: 'LND is required to probe for a route',
    error: [400, 'ExpectedAuthenticatedLndToProbeForRoute'],
  },
  {
    args: {destination, lnd: makeLnd({sendToRouteV2: reachDestination})},
    description: 'Tokens are required to probe for a route',
    error: [400, 'ExpectedTokensValueToProbeForRoute'],
  },
  {
    args: {
      destination: '00',
      lnd: makeLnd({sendToRouteV2: reachDestination}),
      tokens: 1,
    },
    description: 'A probe subscription argument error is returned',
    error: [400, 'ExpectedDestinationPublicKeyToSubscribeToProbe'],
  },
  {
    args: {
      destination,
      lnd: makeLnd({sendToRouteV2: ({}, cbk) => cbk('err')}),
      tokens: 1,
    },
    description: 'A probe error is returned',
    error: [503, 'UnexpectedErrorWhenPayingViaRoute', {err: 'err'}],
  },
  {
    args: {
      destination,
      lnd: makeLnd({sendToRouteV2: ({}, cbk) => setTimeout(cbk, 50)}),
      probe_timeout_ms: 1,
      tokens: 1,
    },
    description: 'A probe times out',
    error: [503, 'ProbeForRouteTimedOut'],
  },
  {
    args: {
      destination,
      lnd: makeLnd({sendToRouteV2: failEarly}),
      tokens: 1,
    },
    description: 'A probe that finds no route returns no route',
    expected: {},
  },
  {
    args: {
      destination,
      lnd: makeLnd({sendToRouteV2: reachDestination}),
      tokens: 1,
    },
    description: 'A probe that finds a route returns the route',
    expected: {route: expectedRoute},
  },
  {
    args: {
      lnd: makeLnd({
        response: introductionResponse,
        sendToRouteV2: reachDestination,
      }),
      paths: [path],
      tokens: 1,
    },
    description: 'A probe to a blinded path returns a route into the path',
    expected: {
      route: {
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
            path_key: path.key,
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
            public_key: path.hops[1].relay_key,
            timeout: 60,
          },
        ],
        mtokens: '1011',
        safe_fee: 1,
        safe_tokens: 2,
        timeout: 100,
        tokens: 1,
        total_mtokens: undefined,
      },
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async () => {
    if (!!error) {
      await rejects(probeForRoute(args), error, 'Got expected error');
    } else {
      const res = await probeForRoute(args);

      deepStrictEqual(res, expected, 'Got expected result');
    }

    return;
  });
});
