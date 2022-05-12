const EventEmitter = require('events');

const BN = require('bn.js');
const {test} = require('@alexbosworth/tap');

const {getInfoResponse} = require('./../fixtures');
const {getRouteToDestination} = require('./../../../');

const customRecords = {};

const makeLnd = ({custom, err, res}) => {
  const response = {
    routes: [{
      hops: [{
        amt_to_forward_msat: '1',
        chan_capacity: '1',
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
      queryRoutes: ({}, cbk) => cbk(err, res !== undefined ? res : response),
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
    error: [400, 'ExpectedStandardFormatChannelIdForOutChannel'],
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
      },
    },
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
  return test(description, async ({end, rejects, strictSame}) => {
    if (!!error) {
      await rejects(() => getRouteToDestination(args), error, 'Got error');
    } else {
      strictSame(await getRouteToDestination(args), expected, 'Got route');
    }

    return end();
  });
});
