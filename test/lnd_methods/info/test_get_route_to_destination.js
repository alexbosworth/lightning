const {deepStrictEqual} = require('node:assert').strict;
const EventEmitter = require('events');
const {rejects} = require('node:assert').strict;
const test = require('node:test');

const {getInfoResponse} = require('./../fixtures');
const {getRouteToDestination} = require('./../../../');

const customRecords = {};

const makeLnd = ({custom, err, ignored, outgoing, pref, res, retry}) => {
  // Retryable errors are returned once, on the first query only
  const retries = [];

  const response = {
    routes: [{
      hops: [{
        amt_to_forward_msat: '1',
        chan_id: '1',
        custom_records: custom || customRecords,
        expiry: 1,
        fee_msat: '1',
        pub_key: '00',
      }],
      total_amt: 1,
      total_amt_msat: '1',
      total_fees: '1',
      total_fees_msat: '1',
      total_time_lock: 1,
    }],
    success_prob: 1,
  };

  return {
    chain: {
      registerBlockEpochNtfn: ({}) => {
        const emitter = new EventEmitter();

        emitter.cancel = () => {};

        process.nextTick(() => emitter.emit('error', 'err'));

        return emitter;
      },
    },
    default: {
      getInfo: ({}, cbk) => cbk(null, getInfoResponse),
      queryRoutes: (args, cbk) => {
        const outgoingIds = JSON.stringify(args.outgoing_chan_ids);

        if (!!outgoing && outgoingIds !== JSON.stringify(outgoing)) {
          return cbk('UnexpectedOutgoingChannelIdsInQueryRoutes');
        }

        if (pref !== undefined && args.time_pref !== pref) {
          return cbk('UnexpectedTimePreferenceInQueryRoutes');
        }

        const ignores = {nodes: args.ignored_nodes, pairs: args.ignored_pairs};

        if (!!ignored && JSON.stringify(ignores) !== JSON.stringify(ignored)) {
          return cbk('UnexpectedIgnoredNodesOrPairsInQueryRoutes');
        }

        // Return a retryable error on the first attempt only
        // Exit early with a retryable error on the first query only
        if (!!retry && !retries.length) {
          retries.push(retry);

          return cbk({details: retry});
        }

        return cbk(err, res !== undefined ? res : response);
      },
    },
  };
};

const makeArgs = override => {
  const args = {
    destination: '00',
    lnd: makeLnd({}),
    messages: [],
    payment: '00',
    routes: [[{
      base_fee_mtokens: '1',
      channel: '0x0x0',
      cltv_delta: 1,
      fee_rate: 1,
      public_key: '00',
    }]],
    total_mtokens: '1',
  };

  Object.keys(override).forEach(key => args[key] = override[key]);

  return args;
};

const expectedRoute = {
  route: {
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
    payment: '00',
    safe_fee: 1,
    safe_tokens: 1,
    timeout: 1,
    tokens: 0,
    total_mtokens: '1',
  },
};

const tests = [
  {
    args: makeArgs({confidence: NaN}),
    description: 'Valid confidence is required',
    error: [400, 'ExpectedConfidenceInPartsPerMillionForQuery'],
  },
  {
    args: makeArgs({destination: undefined}),
    description: 'A destination is required',
    error: [400, 'ExpectedDestinationKeyToGetRouteToDestination'],
  },
  {
    args: makeArgs({destination: 'destination'}),
    description: 'The destination must be a hex pubkey',
    error: [400, 'ExpectedDestinationKeyToGetRouteToDestination'],
  },
  {
    args: makeArgs({lnd: undefined}),
    description: 'LND is required',
    error: [400, 'ExpectedLndApiObjectToGetRouteToDestination'],
  },
  {
    args: makeArgs({outgoing_channel: 12345}),
    description: 'Outgoing channel is expected in standard format',
    error: [400, 'ExpectedStandardFormatOutgoingChannelIds'],
  },
  {
    args: makeArgs({outgoing_channels: 'channels'}),
    description: 'Outgoing channels are expected as an array',
    error: [400, 'ExpectedArrayOfOutgoingChannelIds'],
  },
  {
    args: makeArgs({outgoing_channels: [12345]}),
    description: 'Outgoing channels are expected in standard format',
    error: [400, 'ExpectedStandardFormatOutgoingChannelIds'],
  },
  {
    args: makeArgs({payment: undefined}),
    description: 'Total mtokens requires linking payment identifier',
    error: [400, 'ExpectedTotalMtokensWithPaymentIdentifier'],
  },
  {
    args: makeArgs({mtokens: '1', tokens: 1}),
    description: 'Specifying mtokens and tokens, they must be equal',
    error: [400, 'ExpectedEqualValuesForTokensAndMtokens'],
  },
  {
    args: makeArgs({max_fee_mtokens: '1', max_fee: 1}),
    description: 'Specifying fee mtokens and fee tokens, they must be equal',
    error: [400, 'ExpectedEqualValuesForTokensAndMtokens'],
  },
  {
    args: makeArgs({lnd: makeLnd({err: {details: 'target not found'}})}),
    description: 'Target not found error is returned',
    error: [503, 'TargetNotFoundError'],
  },
  {
    args: makeArgs({lnd: makeLnd({err: 'err'})}),
    description: 'Unexpected errors are passed back',
    error: [503, 'UnexpectedErrInGetRouteToDestination', {err: 'err'}],
  },
  {
    args: makeArgs({lnd: makeLnd({res: null})}),
    description: 'A response is expected',
    error: [503, 'ExpectedResponseFromQueryRoutes'],
  },
  {
    args: makeArgs({lnd: makeLnd({res: 'res'})}),
    description: 'An array of routes is expected',
    error: [503, 'ExpectedRoutesArrayFromQueryRoutes'],
  },
  {
    args: makeArgs({lnd: makeLnd({res: {routes: [{}]}})}),
    description: 'Normal routes are expected',
    error: [503, 'UnexpectedResultFromQueryRoutes'],
  },
  {
    args: makeArgs({
      lnd: makeLnd({err: {details: 'unable to find a path to destination'}}),
    }),
    description: 'No route is found with error',
    expected: {},
  },
  {
    args: makeArgs({lnd: makeLnd({err: {details: 'is too large'}})}),
    description: 'Payment cannot exceed maximum size',
    error: [400, 'PaymentTooLargeToFindRoute'],
  },
  {
    args: makeArgs({lnd: makeLnd({res: {routes: []}})}),
    description: 'No route is found',
    expected: {},
  },
  {
    args: makeArgs({confidence: 1e6, lnd: makeLnd({pref: 1})}),
    description: 'A confidence is sent as a time preference',
    expected: expectedRoute,
  },
  {
    args: makeArgs({ignore: 'ignore'}),
    description: 'Ignores are expected as an array',
    error: [400, 'ExpectedArrayOfIgnoresForIgnoredNodes'],
  },
  {
    args: makeArgs({
      ignore: [
        {from_public_key: '00'},
        {from_public_key: '01', to_public_key: '02'},
      ],
      lnd: makeLnd({
        ignored: {
          nodes: [Buffer.from('00', 'hex')],
          pairs: [{
            from: Buffer.from('01', 'hex'),
            to: Buffer.from('02', 'hex'),
          }],
        },
      }),
    }),
    description: 'Ignored nodes and pairs are sent with the query',
    expected: expectedRoute,
  },
  {
    args: makeArgs({lnd: makeLnd({retry: 'device or resource busy'})}),
    description: 'A busy network error is retried',
    expected: expectedRoute,
  },
  {
    args: makeArgs({lnd: makeLnd({retry: 'internal server error'})}),
    description: 'An internal server error is retried',
    expected: expectedRoute,
  },
  {
    args: makeArgs({
      features: [{bit: 1}],
      incoming_peer: '00',
      max_timeout_height: 10,
      payment: undefined,
      lnd: makeLnd({custom: {}}),
      outgoing_channel: '0x0x0',
      routes: undefined,
      total_mtokens: undefined,
    }),
    description: 'A route is returned when no custom records are given',
    expected: {
      route: {
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
      },
    },
  },
  {
    args: makeArgs({
      lnd: makeLnd({outgoing: ['1099511693313']}),
      outgoing_channel: '1x1x1',
    }),
    description: 'The outgoing channel is sent as an outgoing channel id',
    expected: expectedRoute,
  },
  {
    args: makeArgs({
      lnd: makeLnd({outgoing: ['1099511693313', '2199023386626']}),
      outgoing_channel: '0x0x0',
      outgoing_channels: ['1x1x1', '2x2x2'],
    }),
    description: 'Multiple outgoing channels are sent as outgoing channel ids',
    expected: expectedRoute,
  },
  {
    args: makeArgs({
      lnd: makeLnd({outgoing: ['1099511693313']}),
      outgoing_channel: '1x1x1',
      outgoing_channels: [],
    }),
    description: 'An empty set of outgoing channels uses the outgoing channel',
    expected: expectedRoute,
  },
  {
    args: makeArgs({}),
    description: 'A route is returned',
    expected: {
      route: {
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
        payment: '00',
        safe_fee: 1,
        safe_tokens: 1,
        timeout: 1,
        tokens: 0,
        total_mtokens: '1',
      },
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async () => {
    if (!!error) {
      await rejects(() => getRouteToDestination(args), error, 'Got error');
    } else {
      deepStrictEqual(await getRouteToDestination(args), expected, 'Got res');
    }

    return;
  });
});
