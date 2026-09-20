const {deepStrictEqual} = require('node:assert').strict;
const EventEmitter = require('node:events');
const test = require('node:test');

const emitPayment = require('./../../../lnd_methods/offchain/emit_payment');

const id = Buffer.alloc(32).toString('hex');
const publicKey = Buffer.alloc(33).toString('hex');

const makeHtlc = overrides => {
  const htlc = {
    attempt_time_ns: '1',
    resolve_time_ns: '1',
    route: {
      hops: [{
        amt_to_forward: '1',
        amt_to_forward_msat: '1000',
        chan_id: '1',
        custom_records: {},
        expiry: 1,
        fee: '1',
        fee_msat: '1000',
        pub_key: publicKey,
        tlv_payload: true,
      }],
      total_amt: '1',
      total_amt_msat: '1000',
      total_fees: '1',
      total_fees_msat: '1000',
      total_time_lock: 1,
    },
    status: 'IN_FLIGHT',
  };

  Object.keys(overrides || {}).forEach(k => htlc[k] = overrides[k]);

  return htlc;
};

const makePayment = overrides => {
  const payment = {
    creation_date: '1',
    creation_time_ns: '1',
    failure_reason: 'FAILURE_REASON_NONE',
    fee: '1',
    fee_msat: '1000',
    fee_sat: '1',
    htlcs: [makeHtlc({})],
    path: [publicKey],
    payment_hash: id,
    payment_index: '1',
    payment_preimage: id,
    payment_request: '',
    status: 'IN_FLIGHT',
    value: '1',
    value_msat: '1000',
    value_sat: '1',
  };

  Object.keys(overrides || {}).forEach(k => payment[k] = overrides[k]);

  return payment;
};

const failedHtlc = makeHtlc({
  failure: {
    code: 'TEMPORARY_CHANNEL_FAILURE',
    failure_source_index: 1,
    height: 1,
    htlc_msat: '1000',
  },
  status: 'FAILED',
});

const route = {
  fee: 1,
  fee_mtokens: '1000',
  hops: [{
    channel: '0x0x1',
    fee: 1,
    fee_mtokens: '1000',
    forward: 1,
    forward_mtokens: '1000',
    public_key: publicKey,
    timeout: 1,
  }],
  mtokens: '1000',
  payment: undefined,
  timeout: 1,
  tokens: 1,
  total_mtokens: undefined,
};

const tests = [
  {
    args: {data: makePayment({status: 'UNKNOWN'})},
    description: 'An unknown payment status emits nothing',
    expected: {events: []},
  },
  {
    args: {data: makePayment({htlcs: undefined})},
    description: 'A pending payment without an HTLCs array emits nothing',
    expected: {events: []},
  },
  {
    args: {data: makePayment({htlcs: []})},
    description: 'A pending payment without HTLCs emits nothing',
    expected: {events: []},
  },
  {
    args: {data: makePayment({htlcs: [failedHtlc]})},
    description: 'A pending payment with only failed HTLCs emits failures',
    expected: {
      events: [{
        event: 'routing_failure',
        payload: {
          route,
          channel: undefined,
          index: 1,
          mtokens: '1000',
          public_key: publicKey,
          reason: 'TemporaryChannelFailure',
        },
      }],
    },
  },
  {
    args: {data: makePayment({htlcs: [failedHtlc, makeHtlc({})]})},
    description: 'A pending payment emits routing failures and paying',
    expected: {
      events: [
        {
          event: 'routing_failure',
          payload: {
            route,
            channel: undefined,
            index: 1,
            mtokens: '1000',
            public_key: publicKey,
            reason: 'TemporaryChannelFailure',
          },
        },
        {
          event: 'paying',
          payload: {
            created_at: '1970-01-01T00:00:00.000Z',
            destination: publicKey,
            id,
            index: '1',
            mtokens: '2000',
            paths: [route],
            request: undefined,
            safe_tokens: 2,
            timeout: 1,
            tokens: 2,
          },
        },
      ],
    },
  },
  {
    args: {
      data: makePayment({
        htlcs: [makeHtlc({status: 'SUCCEEDED'})],
        status: 'SUCCEEDED',
      }),
    },
    description: 'A confirmed payment emits confirmed',
    expected: {
      events: [{
        event: 'confirmed',
        payload: {
          confirmed_at: '1970-01-01T00:00:00.000Z',
          created_at: '1970-01-01T00:00:00.000Z',
          destination: publicKey,
          fee: 1,
          fee_mtokens: '1000',
          hops: route.hops,
          id,
          index: '1',
          mtokens: '2000',
          paths: [{
            fee: 1,
            fee_mtokens: '1000',
            hops: route.hops,
            mtokens: '1000',
            payment: undefined,
            timeout: 1,
            tokens: 1,
            total_mtokens: undefined,
          }],
          request: undefined,
          safe_fee: 1,
          safe_tokens: 2,
          secret: id,
          timeout: 1,
          tokens: 2,
        },
      }],
    },
  },
  {
    args: {
      data: makePayment({
        failure_reason: 'FAILURE_REASON_NO_ROUTE',
        status: 'FAILED',
      }),
    },
    description: 'A failed payment emits failed',
    expected: {
      events: [{
        event: 'failed',
        payload: {
          id,
          is_canceled: false,
          is_insufficient_balance: false,
          is_invalid_payment: false,
          is_pathfinding_timeout: false,
          is_route_not_found: true,
        },
      }],
    },
  },
  {
    args: {data: makePayment({htlcs: [makeHtlc({route: undefined})]})},
    description: 'A payment that cannot be mapped emits an error',
    expected: {
      events: [{
        event: 'error',
        payload: [503, 'ExpectedRouteAttemptedInRpcAttemptDetails'],
      }],
    },
  },
  {
    args: {data: makePayment({htlcs: [makeHtlc({route: undefined})]})},
    description: 'A payment that cannot be mapped without a listener is quiet',
    expected: {events: []},
    is_unlistened: true,
  },
];

tests.forEach(({args, description, expected, is_unlistened}) => {
  return test(description, (t, end) => {
    const emitter = new EventEmitter();
    const events = [];

    ['confirmed', 'failed', 'paying', 'routing_failure'].forEach(event => {
      return emitter.on(event, payload => events.push({event, payload}));
    });

    if (!is_unlistened) {
      emitter.on('error', payload => events.push({event: 'error', payload}));
    }

    emitPayment({emitter, data: args.data});

    deepStrictEqual(events, expected.events, 'Got expected events');

    return end();
  });
});
