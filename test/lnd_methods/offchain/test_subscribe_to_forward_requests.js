const {deepStrictEqual} = require('node:assert').strict;
const EventEmitter = require('node:events');
const test = require('node:test');
const {throws} = require('node:assert').strict;

const {subscribeToForwardRequests} = require('./../../../');

const circuitKey = {chan_id: '1', htlc_id: '0'};

const makeForwardRequest = overrides => {
  const request = {
    custom_records: {},
    incoming_amount_msat: '2000000',
    incoming_circuit_key: circuitKey,
    incoming_expiry: 100,
    onion_blob: Buffer.alloc(1),
    outgoing_amount_msat: '1999000',
    outgoing_expiry: 90,
    outgoing_requested_chan_id: '2',
    payment_hash: Buffer.alloc(32),
  };

  Object.keys(overrides || {}).forEach(k => request[k] = overrides[k]);

  return request;
};

const makeLnd = () => {
  const emitter = new EventEmitter();

  emitter.cancel = () => emitter.is_cancelled = true;
  emitter.write = args => emitter.writes.push(args);
  emitter.writes = [];

  return {emitter, lnd: {router: {htlcInterceptor: ({}) => emitter}}};
};

const tests = [
  {
    args: {},
    description: 'An LND object is required to subscribe to forward requests',
    error: 'ExpectedAuthenticatedLndToSubscribeToForwardRequests',
  },
  {
    data: makeForwardRequest({}),
    description: 'A forward request is emitted',
    expected: {
      errors: [],
      request: {
        cltv_delta: 10,
        fee: 1,
        fee_mtokens: '1000',
        hash: Buffer.alloc(32).toString('hex'),
        in_channel: '0x0x1',
        in_payment: 0,
        messages: [],
        mtokens: '1999000',
        onion: '00',
        out_channel: '0x0x2',
        timeout: 100,
        tokens: 1999,
      },
      writes: [
        {action: 'RESUME', incoming_circuit_key: circuitKey},
        {action: 'FAIL', incoming_circuit_key: circuitKey},
        {
          action: 'SETTLE',
          incoming_circuit_key: circuitKey,
          preimage: Buffer.alloc(32),
        },
      ],
    },
  },
  {
    data: makeForwardRequest({outgoing_amount_msat: '2000500'}),
    description: 'A request to forward more than received is left to LND',
    expected: {
      errors: [],
      request: undefined,
      writes: [{action: 'RESUME', incoming_circuit_key: circuitKey}],
    },
  },
  {
    data: makeForwardRequest({outgoing_expiry: 101}),
    description: 'A request with an outbound CLTV past inbound is left to LND',
    expected: {
      errors: [],
      request: undefined,
      writes: [{action: 'RESUME', incoming_circuit_key: circuitKey}],
    },
  },
  {
    data: {incoming_circuit_key: circuitKey},
    description: 'An invalid forward request is rejected with an error',
    expected: {
      errors: [[503, 'ExpectedCustomRecordsInRpcForwardRequest']],
      request: undefined,
      writes: [{action: 'FAIL', incoming_circuit_key: circuitKey}],
    },
  },
];

tests.forEach(({args, data, description, error, expected}) => {
  return test(description, (t, end) => {
    if (!!error) {
      throws(() => subscribeToForwardRequests(args), new Error(error));

      return end();
    }

    const {emitter, lnd} = makeLnd();

    const errors = [];
    let gotRequest;

    const sub = subscribeToForwardRequests({lnd});

    sub.on('error', err => errors.push(err));
    sub.on('forward_request', request => gotRequest = request);

    emitter.emit('data', data);

    if (!!gotRequest) {
      const {accept, reject, settle} = gotRequest;

      delete gotRequest.accept;
      delete gotRequest.reject;
      delete gotRequest.settle;

      accept();
      reject();
      settle({secret: Buffer.alloc(32).toString('hex')});
    }

    deepStrictEqual(gotRequest, expected.request, 'Got expected request');
    deepStrictEqual(emitter.writes, expected.writes, 'Got expected writes');
    deepStrictEqual(errors, expected.errors, 'Got expected errors');

    emitter.emit('error', 'err');

    deepStrictEqual(errors.pop(), 'err', 'Subscription errors are emitted');

    sub.removeAllListeners();

    deepStrictEqual(emitter.is_cancelled, true, 'Subscription is cancelled');

    return end();
  });
});
