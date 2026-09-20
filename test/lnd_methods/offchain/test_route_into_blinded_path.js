const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

const method = require('./../../../lnd_methods/offchain/route_into_blinded_path');

const blindedKey = `03${'02'.repeat(32)}`;
const introductionNode = `02${'01'.repeat(32)}`;
const pathKey = `02${'03'.repeat(32)}`;
const relayKey = `02${'04'.repeat(32)}`;

const makePath = overrides => {
  const path = {
    cltv_delta: 144,
    hops: [
      {encrypted_data: '01', relay_key: introductionNode},
      {encrypted_data: '02', relay_key: relayKey},
      {encrypted_data: '03', relay_key: blindedKey},
    ],
    introduction_node: introductionNode,
    key: pathKey,
  };

  Object.keys(overrides || {}).forEach(k => path[k] = overrides[k]);

  return path;
};

const makeRoute = overrides => {
  const route = {
    confidence: 1000000,
    fee: 1,
    fee_mtokens: '1500',
    hops: [
      {
        channel: '1x1x1',
        fee: 1,
        fee_mtokens: '1500',
        forward: 100,
        forward_mtokens: '100010',
        public_key: relayKey,
        timeout: 950,
      },
      {
        channel: '2x2x2',
        fee: 0,
        fee_mtokens: '0',
        forward: 100,
        forward_mtokens: '100010',
        public_key: introductionNode,
        timeout: 900,
      },
    ],
    mtokens: '101510',
    safe_fee: 2,
    safe_tokens: 102,
    timeout: 950,
    tokens: 101,
  };

  Object.keys(overrides || {}).forEach(k => route[k] = overrides[k]);

  return route;
};

const tests = [
  {
    args: {},
    description: 'Millitokens to deliver are required',
    error: 'ExpectedMillitokensToDeliverToRouteIntoBlindedPath',
  },
  {
    args: {mtokens: '100000'},
    description: 'A blinded path is required',
    error: 'ExpectedBlindedPathToExtendRouteInto',
  },
  {
    args: {mtokens: '100000', path: makePath({cltv_delta: undefined})},
    description: 'A blinded path cltv delta is required',
    error: 'ExpectedBlindedPathCltvDeltaToExtendRouteInto',
  },
  {
    args: {mtokens: '100000', path: makePath({hops: []})},
    description: 'Blinded path hops are required',
    error: 'ExpectedBlindedPathHopsToExtendRouteInto',
  },
  {
    args: {mtokens: '100000', path: makePath({hops: [{relay_key: relayKey}]})},
    description: 'Blinded path hop encrypted data is required',
    error: 'ExpectedBlindedPathHopEncryptedDataToExtendRouteInto',
  },
  {
    args: {mtokens: '100000', path: makePath({hops: [{encrypted_data: '01'}]})},
    description: 'Blinded path hop relay keys are required',
    error: 'ExpectedBlindedPathHopRelayKeysToExtendRouteInto',
  },
  {
    args: {mtokens: '100000', path: makePath({key: undefined})},
    description: 'A blinded path key is required',
    error: 'ExpectedBlindedPathKeyToExtendRouteInto',
  },
  {
    args: {mtokens: '100000', path: makePath({}), route: {hops: []}},
    description: 'A route to the introduction node is required',
    error: 'ExpectedRouteToIntroductionNodeToExtendIntoBlindedPath',
  },
  {
    args: {
      mtokens: '100000',
      path: makePath({}),
      route: makeRoute({hops: makeRoute({}).hops.slice().reverse()}),
    },
    description: 'The route is expected to end at the introduction node',
    error: 'ExpectedRouteEndingAtBlindedPathIntroductionNode',
  },
  {
    args: {mtokens: '100011', path: makePath({}), route: makeRoute({})},
    description: 'The route is expected to forward the delivery amount',
    error: 'ExpectedRouteToIntroductionNodeToForwardDeliveryAmount',
  },
  {
    args: {
      mtokens: '100000',
      path: makePath({cltv_delta: 900}),
      route: makeRoute({}),
    },
    description: 'The route timeout is expected to cover the path delta',
    error: 'ExpectedRouteTimeoutToCoverBlindedPathCltvDelta',
  },
  {
    args: {mtokens: '100000', path: makePath({}), route: makeRoute({})},
    description: 'A route is extended into a blinded path',
    expected: {
      route: {
        confidence: 1000000,
        fee: 1,
        fee_mtokens: '1510',
        hops: [
          {
            channel: '1x1x1',
            fee: 1,
            fee_mtokens: '1500',
            forward: 100,
            forward_mtokens: '100010',
            public_key: relayKey,
            timeout: 950,
          },
          {
            channel: '2x2x2',
            encrypted_data: '01',
            fee: 0,
            fee_mtokens: '10',
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
            forward: 0,
            forward_mtokens: '0',
            public_key: relayKey,
            timeout: 0,
          },
          {
            channel: '0x0x0',
            encrypted_data: '03',
            fee: 0,
            fee_mtokens: '0',
            forward: 100,
            forward_mtokens: '100000',
            public_key: blindedKey,
            timeout: 756,
          },
        ],
        mtokens: '101510',
        safe_fee: 2,
        safe_tokens: 102,
        timeout: 950,
        tokens: 101,
        total_mtokens: undefined,
      },
    },
  },
  {
    args: {
      mtokens: '100000',
      path: makePath({introduction_node: undefined}),
      route: makeRoute({}),
      total_mtokens: '200000',
    },
    description: 'A route is extended into a blinded path with a total',
    expected: {
      route: {
        confidence: 1000000,
        fee: 1,
        fee_mtokens: '1510',
        hops: [
          {
            channel: '1x1x1',
            fee: 1,
            fee_mtokens: '1500',
            forward: 100,
            forward_mtokens: '100010',
            public_key: relayKey,
            timeout: 950,
          },
          {
            channel: '2x2x2',
            encrypted_data: '01',
            fee: 0,
            fee_mtokens: '10',
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
            forward: 0,
            forward_mtokens: '0',
            public_key: relayKey,
            timeout: 0,
          },
          {
            channel: '0x0x0',
            encrypted_data: '03',
            fee: 0,
            fee_mtokens: '0',
            forward: 100,
            forward_mtokens: '100000',
            public_key: blindedKey,
            timeout: 756,
          },
        ],
        mtokens: '101510',
        safe_fee: 2,
        safe_tokens: 102,
        timeout: 950,
        tokens: 101,
        total_mtokens: '200000',
      },
    },
  },
  {
    args: {
      mtokens: '100010',
      path: makePath({
        hops: [{encrypted_data: '01', relay_key: introductionNode}],
      }),
      route: makeRoute({}),
    },
    description: 'A route is extended into a single hop blinded path',
    expected: {
      route: {
        confidence: 1000000,
        fee: 1,
        fee_mtokens: '1500',
        hops: [
          {
            channel: '1x1x1',
            fee: 1,
            fee_mtokens: '1500',
            forward: 100,
            forward_mtokens: '100010',
            public_key: relayKey,
            timeout: 950,
          },
          {
            channel: '2x2x2',
            encrypted_data: '01',
            fee: 0,
            fee_mtokens: '0',
            forward: 100,
            forward_mtokens: '100010',
            path_key: pathKey,
            public_key: introductionNode,
            timeout: 900,
          },
        ],
        mtokens: '101510',
        safe_fee: 2,
        safe_tokens: 102,
        timeout: 950,
        tokens: 101,
        total_mtokens: undefined,
      },
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, (t, end) => {
    if (!!error) {
      throws(() => method(args), new Error(error), 'Got expected error');
    } else {
      deepStrictEqual(method(args), expected, 'Got expected route');
    }

    return end();
  });
});
