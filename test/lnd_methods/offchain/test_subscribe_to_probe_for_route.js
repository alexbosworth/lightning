const {createECDH} = require('node:crypto');
const {createHash} = require('node:crypto');
const {deepStrictEqual} = require('node:assert').strict;
const EventEmitter = require('node:events');
const test = require('node:test');
const {throws} = require('node:assert').strict;

const {chanNumber} = require('bolt07');
const {decryptBlindedPath} = require('bolt04');
const {paymentPathFromChannels} = require('bolt04');

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

const sha256 = n => createHash('sha256').update(n).digest();

// The public key of a private key number
const publicKeyFor = number => {
  const ecdh = createECDH('secp256k1');

  ecdh.setPrivateKey(Buffer.from(number.toString(16).padStart(64, '0'), 'hex'));

  return ecdh.getPublicKey('hex', 'compressed');
};

// The node has private key one so its shared point with a path key is the key
const self = publicKeyFor(1);
const peer = publicKeyFor(2);
const other = publicKeyFor(3);

// Forwarding policies of the nodes of a channel
const policiesFor = keys => keys.map(key => ({
  base_fee_mtokens: '1000',
  cltv_delta: 40,
  fee_rate: 100,
  max_htlc_mtokens: '100000000',
  min_htlc_mtokens: '1',
  public_key: key,
}));

// The channel of the node with the peer
const selfChannel = id => ({id, policies: policiesFor([self, peer])});

// A path that starts at the node and goes over a channel to the peer
const makeSelfPath = ({channel, destination, hops}) => paymentPathFromChannels({
  channels: !channel ? [] : [selfChannel(channel)],
  cltv_delta: 18,
  current_block_height: 100,
  destination: destination || peer,
  hop_count: hops,
  max_mtokens: '100000000',
});

// A path that starts at the node and goes through the peer to another node
const throughPeerPath = paymentPathFromChannels({
  channels: [
    selfChannel('1x2x3'),
    {id: '4x5x6', policies: policiesFor([peer, other])},
  ],
  cltv_delta: 18,
  current_block_height: 100,
  destination: other,
  max_mtokens: '100000000',
});

// The next path key after the hop of the node at the start of a path
const nextPathKey = path => decryptBlindedPath({
  encrypted: path.hops[0].encrypted_data,
  key: path.key,
  secret: sha256(Buffer.from(path.key, 'hex')).toString('hex'),
}).next_path_key;

// Paths over a channel and over an alias, to an unknown channel, and to self
const selfPath = makeSelfPath({channel: '1x2x3'});
const aliasPath = makeSelfPath({channel: '16000000x0x1', hops: 3});
const lostPath = makeSelfPath({channel: '9x9x9'});
const toSelfPath = makeSelfPath({destination: self, hops: 3});

// A path that starts at the node with a path key that is not a curve point
const offCurvePath = Object.assign({}, selfPath, {key: `02${'05'.repeat(32)}`});

// A path that starts at the node with no fees for the fee the node charges
const underpaidPath = Object.assign({}, selfPath, {
  base_fee_mtokens: '0',
  fee_rate: 0,
});

// The private channel of the node with the peer, known by an alias too
const peerChannel = {
  active: true,
  alias_scids: [chanNumber({channel: '16000000x0x1'}).number],
  capacity: '1',
  chan_id: chanNumber({channel: '1x2x3'}).number,
  channel_point: `${Buffer.alloc(32).toString('hex')}:0`,
  commit_fee: '1',
  commit_weight: '1',
  commitment_type: 'ANCHORS',
  fee_per_kw: '1',
  local_balance: '1',
  local_chan_reserve_sat: '1',
  local_constraints: {},
  num_updates: '1',
  pending_htlcs: [],
  private: true,
  remote_balance: '1',
  remote_chan_reserve_sat: '1',
  remote_constraints: {},
  remote_pubkey: peer,
  thaw_height: 0,
  total_satoshis_received: '1',
  total_satoshis_sent: '1',
  unsettled_balance: '1',
};

// The route to the peer in query routes format, for what the node forwards
const peerRpcRoute = {
  hops: [{
    amt_to_forward_msat: '1000',
    chan_id: chanNumber({channel: '1x2x3'}).number,
    custom_records: {},
    expiry: 124,
    fee_msat: '0',
    pub_key: peer,
  }],
  total_amt: '1',
  total_amt_msat: '1000',
  total_fees: '0',
  total_fees_msat: '0',
  total_time_lock: 124,
};

// The route to the peer as probed
const peerRoute = {
  confidence: 1000000,
  fee: 0,
  fee_mtokens: '0',
  hops: [{
    channel: '1x2x3',
    fee: 0,
    fee_mtokens: '0',
    forward: 1,
    forward_mtokens: '1000',
    public_key: peer,
    timeout: 124,
  }],
  messages: [],
  mtokens: '1000',
  payment: undefined,
  safe_fee: 0,
  safe_tokens: 1,
  timeout: 124,
  tokens: 1,
  total_mtokens: undefined,
};

// The route to the peer continued into the rest of the path past the node
const selfPathRoute = {
  confidence: 1000000,
  fee: 0,
  fee_mtokens: '0',
  hops: [{
    channel: '1x2x3',
    encrypted_data: selfPath.hops[1].encrypted_data,
    fee: 0,
    fee_mtokens: '0',
    forward: 1,
    forward_mtokens: '1000',
    path_key: nextPathKey(selfPath),
    public_key: peer,
    timeout: 124,
  }],
  mtokens: '1000',
  safe_fee: 0,
  safe_tokens: 1,
  timeout: 124,
  tokens: 1,
  total_mtokens: undefined,
};

// The route to the peer continued into the rest of the path with a dummy hop
const aliasPathRoute = {
  confidence: 1000000,
  fee: 0,
  fee_mtokens: '0',
  hops: [
    {
      channel: '1x2x3',
      encrypted_data: aliasPath.hops[1].encrypted_data,
      fee: 0,
      fee_mtokens: '0',
      forward: 0,
      forward_mtokens: '0',
      path_key: nextPathKey(aliasPath),
      public_key: peer,
      timeout: 0,
    },
    {
      channel: '0x0x0',
      encrypted_data: aliasPath.hops[2].encrypted_data,
      fee: 0,
      fee_mtokens: '0',
      forward: 1,
      forward_mtokens: '1000',
      public_key: aliasPath.hops[2].relay_key,
      timeout: 106,
    },
  ],
  mtokens: '1000',
  safe_fee: 0,
  safe_tokens: 1,
  timeout: 124,
  tokens: 1,
  total_mtokens: undefined,
};

// Make an LND that is the introduction node of paths to its peer
const makeSelfLnd = ({deriveSharedKey, routes}) => {
  const lnd = makeBlindedLnd({routes: routes || {[peer]: peerRpcRoute}});

  const info = Object.assign({}, getInfoResponse, {identity_pubkey: self});

  lnd.default.getChanInfo = ({}, cbk) => cbk({details: 'edge not found'});
  lnd.default.getInfo = ({}, cbk) => cbk(null, info);
  lnd.default.listChannels = ({}, cbk) => cbk(null, {channels: [peerChannel]});

  // The shared key of the node and a path key is the hash of the path key
  lnd.signer = {
    deriveSharedKey: deriveSharedKey || (({ephemeral_pubkey}, cbk) => {
      return cbk(null, {shared_key: sha256(ephemeral_pubkey)});
    }),
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
    args: {
      lnd: makeBlindedLnd({routes: {}}),
      max_fee_mtokens: 'max',
      paths: [makePath({})],
      tokens: 1,
    },
    description: 'A max fee for blinded paths is expected to be millitokens',
    error: 'ExpectedMaxFeeMillitokensToProbeToBlindedPaths',
  },
  {
    args: {
      lnd: makeBlindedLnd({routes: {}}),
      max_fee_mtokens: '-1',
      paths: [makePath({})],
      tokens: 1,
    },
    description: 'A max fee for blinded paths is not expected to be negative',
    error: 'ExpectedMaxFeeMillitokensToProbeToBlindedPaths',
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
      lnd: makeLnd({}),
      outgoing_channels: ['1x1x1', '2x2x2'],
      probe_timeout_ms: 1,
      tokens: 1,
    },
    description: 'A probe sends outgoing channels with route queries',
    expected: {
      failures: [],
      requests: [
        {
          amt_msat: '1000',
          dest_features: undefined,
          final_cltv_delta: 46,
          outgoing_chan_ids: ['1099511693313', '2199023386626'],
          pub_key: Buffer.alloc(33).toString('hex'),
        },
        {
          amt_msat: '1000',
          dest_features: undefined,
          final_cltv_delta: 46,
          outgoing_chan_ids: ['1099511693313', '2199023386626'],
          pub_key: Buffer.alloc(33).toString('hex'),
        },
      ],
      routes: [expectedRoute],
    },
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
      tokens: 1,
    },
    description: 'Non-listening errors are not emitted',
    expected: {
      failures: [],
      routes: [],
    },
    listening: ['probe_success', 'probing', 'routing_failure'],
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
            failure_source_index: 1,
          },
          preimage: Buffer.alloc(Number()),
        }),
      }),
      tokens: 1,
    },
    description: 'A throwing success listener is reported and the probe ends',
    expected: {
      error: [503, 'ListenerFailure'],
      failures: [],
      routes: [expectedRoute],
      success: expectedRoute,
    },
    throwing: ['probe_success'],
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
  {
    args: {lnd: makeSelfLnd({}), paths: [selfPath], tokens: 1},
    description: 'A path that starts at the node is probed from the next node',
    expected: {
      failures: [],
      requests: [{
        amt_msat: '1000',
        dest_features: undefined,
        final_cltv_delta: 24,
        pub_key: peer,
      }],
      routes: [peerRoute],
      success: selfPathRoute,
    },
  },
  {
    args: {lnd: makeSelfLnd({}), paths: [aliasPath], tokens: 1},
    description: 'A path that starts at the node over an alias is probed',
    expected: {
      failures: [],
      requests: [{
        amt_msat: '1000',
        dest_features: undefined,
        final_cltv_delta: 24,
        pub_key: peer,
      }],
      routes: [peerRoute],
      success: aliasPathRoute,
    },
  },
  {
    args: {
      lnd: makeSelfLnd({}),
      max_fee_mtokens: '1000',
      paths: [selfPath],
      tokens: 1,
    },
    description: 'The fee of the node is left in the max fee of the route',
    expected: {
      failures: [],
      requests: [{
        amt_msat: '1000',
        dest_features: undefined,
        fee_limit: {fixed_msat: '1000'},
        final_cltv_delta: 24,
        pub_key: peer,
      }],
      routes: [peerRoute],
      success: selfPathRoute,
    },
  },
  {
    args: {
      lnd: makeSelfLnd({}),
      max_fee_mtokens: '10',
      paths: [makePath({}), selfPath],
      tokens: 1,
    },
    description: 'A path past the node fits a max fee under the node fee',
    expected: {
      failures: [],
      requests: [{
        amt_msat: '1000',
        dest_features: undefined,
        fee_limit: {fixed_msat: '10'},
        final_cltv_delta: 24,
        pub_key: peer,
      }],
      routes: [peerRoute],
      success: selfPathRoute,
    },
  },
  {
    args: {
      lnd: makeSelfLnd({routes: {}}),
      max_fee_mtokens: '1001',
      paths: [throughPeerPath],
      tokens: 1,
    },
    description: 'The rest of a path past the node counts against the max fee',
    expected: {
      failures: [],
      requests: [{
        amt_msat: '2001',
        dest_features: undefined,
        fee_limit: {fixed_msat: '0'},
        final_cltv_delta: 64,
        pub_key: peer,
      }],
      routes: [],
    },
  },
  {
    args: {
      lnd: makeSelfLnd({routes: {[introductionNode]: introductionRpcRoute}}),
      paths: [underpaidPath, makePath({})],
      tokens: 1,
    },
    description: 'A path with fees under the fee of the node is left out',
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
    args: {lnd: makeSelfLnd({}), paths: [toSelfPath], tokens: 1},
    description: 'A path that ends at the node is a payment to self',
    expected: {
      error: [400, 'CannotPayToOwnNodeViaBlindedPath'],
      failures: [],
      requests: [],
      routes: [],
    },
  },
  {
    args: {lnd: makeSelfLnd({}), paths: [makePath({}), selfPath], tokens: 1},
    description: 'Paths where only some start at the node are all probed',
    expected: {
      failures: [],
      requests: [
        {
          amt_msat: '1011',
          dest_features: undefined,
          final_cltv_delta: 46,
          pub_key: introductionNode,
        },
        {
          amt_msat: '1000',
          dest_features: undefined,
          final_cltv_delta: 24,
          pub_key: peer,
        },
      ],
      routes: [peerRoute],
      success: selfPathRoute,
    },
  },
  {
    args: {
      lnd: makeSelfLnd({routes: {[introductionNode]: introductionRpcRoute}}),
      paths: [lostPath, makePath({})],
      tokens: 1,
    },
    description: 'A path that starts at the node with no next peer is left out',
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
    args: {lnd: makeSelfLnd({}), paths: [lostPath], tokens: 1},
    description: 'A probe errors when no paths are left past the node',
    expected: {
      error: [503, 'FailedToStepPastOwnNodeInBlindedPaths'],
      failures: [],
      requests: [],
      routes: [],
    },
  },
  {
    args: {
      lnd: makeSelfLnd({
        deriveSharedKey: ({}, cbk) => cbk('err'),
        routes: {[introductionNode]: introductionRpcRoute},
      }),
      paths: [offCurvePath, makePath({})],
      tokens: 1,
    },
    description: 'A path at the node with an invalid path key is left out',
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
      lnd: makeSelfLnd({
        deriveSharedKey: ({ephemeral_pubkey}, cbk) => setTimeout(() => {
          return cbk(null, {shared_key: sha256(ephemeral_pubkey)});
        },
        50),
      }),
      paths: [selfPath],
      probe_timeout_ms: 1,
      tokens: 1,
    },
    description: 'A probe can time out while stepping past the node',
    expected: {
      error: [503, 'ProbeTimeout'],
      failures: [],
      requests: [],
      routes: [],
    },
  },
  {
    args: {
      lnd: makeSelfLnd({
        deriveSharedKey: ({}, cbk) => cbk('err'),
        routes: {[introductionNode]: introductionRpcRoute},
      }),
      paths: [selfPath, makePath({})],
      tokens: 1,
    },
    description: 'A failure to step past the node is an error',
    expected: {
      error: [503, 'UnexpetedErrorDerivingSharedKey', {err: 'err'}],
      failures: [],
      requests: [],
      routes: [],
    },
  },
];

test('A probe to blinded paths looks up the node identity once', (t, end) => {
  const lnd = makeSelfLnd({routes: {[introductionNode]: introductionRpcRoute}});
  const {getInfo} = lnd.default;
  let lookups = 0;

  lnd.default.getInfo = (args, cbk) => {
    lookups++;

    return getInfo(args, cbk);
  };

  // The first path has no route, so the probe tries routes twice
  const sub = subscribeToProbeForRoute({
    lnd,
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
  });

  sub.on('end', () => {
    deepStrictEqual(lnd.requests.length, 2, 'Got routes for both paths');
    deepStrictEqual(lookups, 1, 'Node identity is looked up once');

    return end();
  });
});

tests.forEach(({args, description, error, expected, ...scenario}) => {
  return test(description, (t, end) => {
    if (!!error) {
      throws(() => subscribeToProbeForRoute(args), new Error(error), 'Error');

      return end();
    }

    const errors = [];
    const failures = [];
    const routes = [];
    const successes = [];
    const sub = subscribeToProbeForRoute(args);

    const collectors = {
      error: err => errors.push(err),
      probe_success: ({route}) => successes.push(route),
      probing: ({route}) => routes.push(route),
      routing_failure: failure => failures.push(failure),
    };

    // Listen for every event, unless the case only listens for some of them
    (scenario.listening || Object.keys(collectors)).forEach(event => {
      return sub.on(event, collectors[event]);
    });

    // A throwing listener is a consumer defect and must not end the probe
    (scenario.throwing || []).forEach(event => {
      return sub.on(event, () => {
        throw new Error('ListenerFailure');
      });
    });

    sub.on('end', () => {
      deepStrictEqual(failures, expected.failures, 'Got expected failures');
      deepStrictEqual(errors.pop(), expected.error, 'Got expected error');
      deepStrictEqual(successes.pop(), expected.success, 'Got success');
      deepStrictEqual(routes, expected.routes, 'Got expected routes');

      // Route queries are checked on the attributes each expected query has
      const queries = (expected.requests || []).map((query, i) => {
        const request = args.lnd.requests[i];

        return Object.fromEntries(Object.keys(query).map(key => {
          return [key, request[key]];
        }));
      });

      // Ignored pairs are checked for each route query expected to have them
      const ignores = (expected.ignored || []).map((pairs, i) => {
        return (args.lnd.requests[i].ignored_pairs || []).map(pair => ({
          from: pair.from,
          to: pair.to,
        }));
      });

      deepStrictEqual(queries, expected.requests || [], 'Got queries');
      deepStrictEqual(ignores, expected.ignored || [], 'Got expected ignores');

      return end();
    });

    return;
  });
});
