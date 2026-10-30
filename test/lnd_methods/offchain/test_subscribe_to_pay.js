const {deepStrictEqual} = require('node:assert').strict;
const EventEmitter = require('node:events');
const test = require('node:test');
const {throws} = require('node:assert').strict;

const method = require('./../../../lnd_methods/offchain/subscribe_to_pay');
const {subscriptionEvents} = require('./../macros');

const request = [
  'lntb1500n1pdn4czkpp5ugdqer05qrrxuchrzkcue94th9w2xzasp9qm7d0yxcgp4u',
  'h4kn4qdpa2fjkzep6yprkcmmzv9kzqsmj09c8gmmrw4e8yetwvdujq5n9va6kcct5d',
  '9hkucqzysdlghdpua7uvjjkcfj49psxtlqzkp5pdncffdfk2cp3mp76thrl29qhqgz',
  'ufm503pjj96586n5w6edgw3n66j4rxxs707y4zdjuhyt6qqe5weu4',
].join('');

const featuredRequest = [
  'lnbcrt1u1p0fmafmpp5ptazmjuehcr3dk5wxdqd9uxz4e857w0xwz5h9rnem98wx86',
  'dhk0qdqqcqzpgxq92fjuqsp5ulvng3vsa6spedynlxeaufjy76njua2ykvhdnjztsh',
  'cg92lfd2kq9qy9qsqsf9ct3nsfmfjz9fz9jkh376txuse520jjyg9vmm4tchnd9rh7',
  'umzwwxz7em5wmfx0y2eudcjj98kmgryz9r9evrcp7e4c9rwkemnswsqgptmd9',
].join('');

const makeLnd = ({data, err, is_end}) => {
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
      getInfo: ({}, cbk) => {
        return cbk(null, {
          alias: 'alias',
          best_header_timestamp: 1,
          block_hash: '00',
          block_height: 1,
          chains: [{chain: 'chain', network: 'network'}],
          color: '#000000',
          features: {'1': {is_known: true, is_required: false}},
          identity_pubkey: Buffer.alloc(33).toString('hex'),
          num_active_channels: 1,
          num_peers: 1,
          num_pending_channels: 1,
          synced_to_chain: true,
          uris: [],
          version: 'version',
        });
      },
    },
    router: {
      sendPaymentV2: () => {
        const emitter = new EventEmitter();

        if (!!err) {
          process.nextTick(() => emitter.emit('error', err));
        } else if (!!data) {
          process.nextTick(() => emitter.emit('data', data));
          process.nextTick(() => emitter.emit('end'));
        } else if (!!is_end) {
          process.nextTick(() => emitter.emit('end'));
        }

        return emitter;
      },
    },
  };
};

const makeArgs = overrides => {
  const args = {
    destination: Buffer.alloc(33, 2).toString('hex'),
    id: Buffer.alloc(32).toString('hex'),
    lnd: makeLnd({}),
    tokens: 1,
  };

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const tests = [
  {
    args: {cltv_delta: 1, request: 'request'},
    description: 'A CLTV delta cannot be specified when request is set',
    error: 'UnexpectedCltvDeltaWhenSubscribingToPayPaymentRequest',
  },
  {
    args: {},
    description: 'A destination or a request is required to pay',
    error: 'ExpectedDestinationWhenPaymentRequestNotSpecified',
  },
  {
    args: {destination: 'destination'},
    description: 'An id is required to pay to a destination',
    error: 'ExpectedPaymentHashWhenPaymentRequestNotSpecified',
  },
  {
    args: {request: 'request'},
    description: 'LND is required to subscribe to pay',
    error: 'ExpectedAuthenticatedLndToSubscribeToPayment',
  },
  {
    args: {
      destination: 'destination',
      id: 'id',
      lnd: {router: {sendPaymentV2: {}}},
    },
    description: 'LND is required to subscribe to pay',
    error: 'ExpectedTokenAmountToPayWhenPaymentRequestNotSpecified',
  },
  {
    args: makeArgs({confidence: 2e6}),
    description: 'Confidence must be expressed in parts per million',
    error: 'ExpectedConfidencePartsPerMillionForPaymentReq',
  },
  {
    args: makeArgs({messages: 'messages'}),
    description: 'Messages must be an array',
    error: 'ExpectedArrayOfMessagesToSubscribeToPayment',
  },
  {
    args: makeArgs({messages: [null]}),
    description: 'Messages must have entries',
    error: 'ExpectedMessageEntriesInPaymentMessages',
  },
  {
    args: makeArgs({messages: [{value: '00'}]}),
    description: 'Messages must have a type',
    error: 'ExpectedMessageTypeNumberInPaymentMessages',
  },
  {
    args: makeArgs({messages: [{type: '1', value: 'value'}]}),
    description: 'Messages must have hex encoded values',
    error: 'ExpectedHexEncodedValuesInPaymentMessages',
  },
  {
    args: makeArgs({request: 'request'}),
    description: 'A valid payment request is required to pay a request',
    error: 'ExpectedValidPaymentRequestToMakePayment',
  },
  {
    args: makeArgs({routes: 'routes'}),
    description: 'Routes must be an array',
    error: 'UnexpectedFormatForRoutesWhenSubscribingToPayment',
  },
  {
    args: makeArgs({routes: [[]]}),
    description: 'Routes must be valid routes',
    error: 'ExpectedValidRoutesWhenSubscribingToPayment',
  },
  {
    args: makeArgs({features: [{bit: 30}]}),
    description: 'Unsupported payment features are an error',
    expected: {
      events: [{
        event: 'error',
        data: [501, 'UnsupportedPaymentFeatureInPayRequest', {bit: 30}],
      }],
    },
  },
  {
    args: makeArgs({lnd: makeLnd({err: 'err'})}),
    description: 'Unexpected payment errors are emitted',
    expected: {
      events: [{
        event: 'error',
        data: [503, 'UnexpectedPaymentError', {err: 'err'}],
      }],
    },
  },
  {
    args: makeArgs({
      lnd: makeLnd({err: {details: 'cltv limit 1 should be greater than 2'}}),
    }),
    description: 'A CLTV limit error is emitted as a route not found failure',
    expected: {events: [{event: 'failed', data: {is_route_not_found: true}}]},
  },
  {
    args: makeArgs({outgoing_channels: 'channels'}),
    description: 'Errors are not emitted when there is no error listener',
    expected: {events: []},
    listening: ['confirmed', 'failed', 'paying', 'routing_failure'],
  },
  {
    args: makeArgs({lnd: makeLnd({is_end: true})}),
    description: 'A payment subscription that ends emits nothing',
    expected: {events: []},
  },
  {
    args: makeArgs({
      request,
      destination: undefined,
      id: undefined,
      lnd: makeLnd({is_end: true}),
      max_timeout_height: 1e6,
      tokens: undefined,
    }),
    description: 'A payment request is paid with a max timeout height',
    expected: {events: []},
  },
  {
    args: makeArgs({
      confidence: 5e5,
      destination: undefined,
      id: undefined,
      lnd: makeLnd({is_end: true}),
      max_fee: 1,
      payment: Buffer.alloc(32, 1).toString('hex'),
      request: featuredRequest,
      tokens: undefined,
    }),
    description: 'A payment request with features is paid',
    expected: {events: []},
  },
  {
    args: makeArgs({
      cltv_delta: 40,
      lnd: makeLnd({data: {htlcs: [], status: 'IN_FLIGHT'}, is_end: true}),
    }),
    description: 'Payment updates are relayed to the subscription',
    expected: {events: []},
  },
  {
    args: makeArgs({max_timeout_height: 2}),
    description: 'A max timeout height too near the current height fails',
    expected: {
      events: [{
        event: 'error',
        data: [
          400,
          'MaxTimeoutTooNearCurrentHeightToMakePayment',
          {last_cltv: 43, max_delta: 1},
        ],
      }],
    },
  },
  {
    args: makeArgs({
      lnd: makeLnd({is_end: true}),
      messages: [{type: '1', value: '00'}],
      routes: [[{
        base_fee_mtokens: '1000',
        channel: '0x0x1',
        cltv_delta: 1,
        fee_rate: 1,
        public_key: Buffer.alloc(33, 3).toString('hex'),
      }]],
    }),
    description: 'Messages and route hints are included in a payment',
    expected: {events: []},
  },
  {
    args: makeArgs({outgoing_channels: 'channels'}),
    description: 'Outgoing channels must be an array',
    expected: {
      events: [{
        event: 'error',
        data: [400, 'ExpectedArrayOfOutgoingChannelIdsToSubscribeToPay'],
      }],
    },
  },
  {
    args: makeArgs({outgoing_channels: [12345]}),
    description: 'Outgoing channels must be standard format channel ids',
    expected: {
      events: [{
        event: 'error',
        data: [400, 'ExpectedStandardFormatOutgoingChannelIdsToPay'],
      }],
    },
  },
  {
    args: makeArgs({outgoing_channel: 12345}),
    description: 'The outgoing channel must be a standard format channel id',
    expected: {
      events: [{
        event: 'error',
        data: [400, 'ExpectedStandardFormatOutgoingChannelIdsToPay'],
      }],
    },
  },
];

tests.forEach(({args, description, error, expected, ...scenario}) => {
  return test(description, async () => {
    if (!!error) {
      throws(() => method(args), new Error(error), 'Got err');

      return;
    }

    // The payment stream is made by the mock LND after the subscription starts
    const got = await subscriptionEvents({
      ...scenario,
      events: ['confirmed', 'error', 'failed', 'paying', 'routing_failure'],
      stream: [],
      subscribe: () => method(args),
    });

    deepStrictEqual(got, {cancels: [], ...expected}, 'Got expected events');

    return;
  });
});
