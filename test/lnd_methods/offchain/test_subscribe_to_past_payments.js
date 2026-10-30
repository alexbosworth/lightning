const {deepStrictEqual} = require('node:assert').strict;
const EventEmitter = require('node:events');
const test = require('node:test');
const {throws} = require('node:assert').strict;

const {subscribeToPastPayments} = require('./../../../lnd_methods');
const {subscriptionEvents} = require('./../macros');

const listenerFailure = {event: 'error', data: [503, 'ListenerFailure']};

// A settled payment as returned by the track payment RPC
const rpcPayment = {
  creation_date: '1',
  creation_time_ns: '1',
  failure_reason: 'FAILURE_REASON_NONE',
  fee: '1',
  fee_msat: '1000',
  fee_sat: '1',
  htlcs: [{
    attempt_time_ns: '1',
    status: 'SUCCEEDED',
    resolve_time_ns: '1',
    route: {
      hops: [{
        amt_to_forward: '1',
        amt_to_forward_msat: '1000',
        chan_id: '1',
        custom_records: {'1': Buffer.alloc(1)},
        expiry: 1,
        fee: '1',
        fee_msat: '1000',
        mpp_record: {payment_addr: Buffer.alloc(32), total_amt_msat: '1000'},
        pub_key: Buffer.alloc(33).toString('hex'),
        tlv_payload: true,
      }],
      total_amt: '1',
      total_amt_msat: '1000',
      total_time_lock: 1,
      total_fees: '1',
      total_fees_msat: '1000',
    },
  }],
  path: [Buffer.alloc(33).toString('hex')],
  payment_hash: Buffer.alloc(32).toString('hex'),
  payment_index: '1',
  payment_preimage: Buffer.alloc(32).toString('hex'),
  payment_request: '',
  status: 'SUCCEEDED',
  value: '1',
  value_msat: '1000',
  value_sat: '1',
};

const makeHtlcEvent = overrides => ({
  event_type: 'SEND',
  forward_event: undefined,
  incoming_channel_id: '1',
  incoming_htlc_id: '0',
  outgoing_channel_id: '2',
  outgoing_htlc_id: '1',
  settle_event: {preimage: Buffer.alloc(32, 1)},
  timestamp_ns: 1e8,
  ...overrides,
});

// A payment that did not succeed as returned by the track payment RPC
const rpcFailedPayment = {
  ...rpcPayment,
  failure_reason: 'FAILURE_REASON_NO_ROUTE',
  status: 'FAILED',
};

// Make a payment lookup stream that answers with a payment or an error
const makeLookup = ({err, payment}) => {
  const emitter = new EventEmitter();

  emitter.cancel = () => {};

  process.nextTick(() => {
    // Exit early when the lookup fails
    if (!!err) {
      return emitter.emit('error', err);
    }

    emitter.emit('data', payment);

    return emitter.emit('end');
  });

  return emitter;
};

// The past payment as emitted for the settled payment lookup
const pastPayment = {
  confirmed_at: '1970-01-01T00:00:00.000Z',
  created_at: '1970-01-01T00:00:00.000Z',
  destination: '000000000000000000000000000000000000000000000000000000000000000000',
  fee: 1,
  fee_mtokens: '1000',
  hops: [
    {
      channel: '0x0x1',
      fee: 1,
      fee_mtokens: '1000',
      forward: 1,
      forward_mtokens: '1000',
      public_key: '000000000000000000000000000000000000000000000000000000000000000000',
      timeout: 1,
    }
  ],
  id: '0000000000000000000000000000000000000000000000000000000000000000',
  index: '1',
  mtokens: '2000',
  paths: [
    {
      fee: 1,
      fee_mtokens: '1000',
      hops: [
        {
          channel: '0x0x1',
          fee: 1,
          fee_mtokens: '1000',
          forward: 1,
          forward_mtokens: '1000',
          public_key: '000000000000000000000000000000000000000000000000000000000000000000',
          timeout: 1,
        }
      ],
      mtokens: '1000',
      payment: '0000000000000000000000000000000000000000000000000000000000000000',
      timeout: 1,
      tokens: 1,
      total_mtokens: '1000',
    }
  ],
  request: undefined,
  safe_fee: 1,
  safe_tokens: 2,
  secret: '0000000000000000000000000000000000000000000000000000000000000000',
  timeout: 1,
  tokens: 2,
};

const tests = [
  {
    args: {},
    description: 'LND is required',
    error: 'ExpectedAuthenticatedLndToSubscribeToPayments',
  },
  {
    args: {},
    description: 'Subscribed and final HTLC events are ignored',
    expected: {events: []},
    stream: [
      ['data', {subscribed_event: {}}],
      ['data', {final_htlc_event: {}}],
    ],
  },
  {
    args: {},
    description: 'A failed payment lookup is ignored',
    expected: {events: []},
    lookup: {err: 'err'},
  },
  {
    args: {},
    description: 'A looked up payment that did not succeed is ignored',
    expected: {events: []},
    lookup: {payment: rpcFailedPayment},
  },
  {
    args: {},
    description: 'A throwing listener is reported without ending the stream',
    expected: {
      events: [
        {event: 'payment', data: pastPayment},
        listenerFailure,
        {event: 'payment', data: pastPayment},
        listenerFailure,
      ],
    },
    stream: [['data', makeHtlcEvent({})], ['data', makeHtlcEvent({})]],
    throwing: ['payment'],
  },
  {
    args: {},
    description: 'Errors are emitted',
    expected: {
      cancels: ['cancel'],
      events: [{
        event: 'error',
        data: [503, 'UnexpectedPastPaymentsErr', {err: {}}],
      }],
    },
    stream: [['error', {}]],
  },
  {
    args: {},
    description: 'HTLCs should be well formed',
    expected: {
      cancels: ['cancel'],
      events: [{
        event: 'error',
        data: [503, 'ExpectedHtlcEventTypeToDeriveForwardFromHtlcEvent'],
      }],
    },
    stream: [['data', {}]],
  },
  {
    args: {},
    description: 'Only real past payments are emitted',
    expected: {events: []},
    lookup: {payment: {}},
  },
  {
    args: {},
    description: 'A past payment is emitted',
    expected: {events: [{event: 'payment', data: pastPayment}]},
    stream: [
      ['data', makeHtlcEvent({settle_event: {preimage: Buffer.alloc(0)}})],
      ['data', makeHtlcEvent({})],
    ],
  },
];

tests.forEach(({args, description, error, expected, ...scenario}) => {
  return test(description, async () => {
    if (!!error) {
      throws(() => subscribeToPastPayments(args), new Error(error), 'Got err');

      return;
    }

    const got = await subscriptionEvents({
      ...scenario,
      events: ['error', 'payment'],
      stream: scenario.stream || [['data', makeHtlcEvent({})]],
      subscribe: stream => {
        args.lnd = {
          router: {
            subscribeHtlcEvents: () => stream,
            trackPaymentV2: () => {
              return makeLookup(scenario.lookup || {payment: rpcPayment});
            },
          },
        };

        return subscribeToPastPayments(args);
      },
    });

    deepStrictEqual(got, {cancels: [], ...expected}, 'Got expected events');

    return;
  });
});
