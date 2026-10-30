const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

const {subscribeToForwardRequests} = require('./../../../');
const {subscriptionEvents} = require('./../macros');

const circuitKey = {chan_id: '1', htlc_id: '0'};
const fail = {action: 'FAIL', incoming_circuit_key: circuitKey};
const forwardRequest = 'forward_request';
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

  Object.keys(overrides).forEach(k => request[k] = overrides[k]);

  return request;
};
const request = {
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
};
const resume = {action: 'RESUME', incoming_circuit_key: circuitKey};
const settle = {
  action: 'SETTLE',
  incoming_circuit_key: circuitKey,
  preimage: Buffer.alloc(32),
};

// Accept, reject and settle a received request, leaving the request details
const handleRequest = ({accept, reject, settle, ...request}) => {
  accept();
  reject();
  settle({secret: Buffer.alloc(32).toString('hex')});

  return request;
};

const tests = [
  {
    args: {},
    description: 'An LND object is required to subscribe to forward requests',
    error: 'ExpectedAuthenticatedLndToSubscribeToForwardRequests',
  },
  {
    args: {},
    description: 'A forward request is emitted',
    expected: {
      events: [
        {event: forwardRequest, data: request},
        {event: 'error', data: 'err'},
      ],
      writes: [resume, fail, settle],
    },
    stream: [['data', makeForwardRequest({})], ['error', 'err']],
  },
  {
    args: {},
    description: 'A request to forward more than received is left to LND',
    expected: {events: [], writes: [resume]},
    stream: [['data', makeForwardRequest({outgoing_amount_msat: '2000500'})]],
  },
  {
    args: {},
    description: 'A request with an outbound CLTV past inbound is left to LND',
    expected: {events: [], writes: [resume]},
    stream: [['data', makeForwardRequest({outgoing_expiry: 101})]],
  },
  {
    args: {},
    description: 'An invalid forward request is rejected with an error',
    expected: {
      events: [{
        event: 'error',
        data: [503, 'ExpectedCustomRecordsInRpcForwardRequest'],
      }],
      writes: [fail],
    },
    stream: [['data', {incoming_circuit_key: circuitKey}]],
  },
  {
    args: {},
    description: 'An invalid forward request is rejected without a listener',
    expected: {events: [], writes: [fail]},
    listening: [forwardRequest],
    stream: [['data', {incoming_circuit_key: circuitKey}], ['error', 'err']],
  },
  {
    args: {},
    description: 'A throwing listener fails the HTLC back and is reported',
    expected: {
      events: [
        {event: forwardRequest, data: request},
        {event: 'error', data: [503, 'ListenerFailure']},
        {event: forwardRequest, data: request},
        {event: 'error', data: [503, 'ListenerFailure']},
      ],
      writes: [resume, fail, settle, fail, resume, fail, settle, fail],
    },
    stream: [
      ['data', makeForwardRequest({})],
      ['data', makeForwardRequest({})],
    ],
    throwing: [forwardRequest],
  },
  {
    args: {},
    description: 'Removing the last request listener cancels the stream',
    expected: {cancels: ['cancel'], events: [], writes: []},
    removing: ['error', forwardRequest],
    stream: [],
  },
];

tests.forEach(({args, description, error, expected, ...scenario}) => {
  return test(description, async () => {
    if (!!error) {
      throws(() => subscribeToForwardRequests(args), new Error(error));

      return;
    }

    const writes = [];

    const got = await subscriptionEvents({
      ...scenario,
      events: ['error', forwardRequest],
      handling: {[forwardRequest]: handleRequest},
      subscribe: stream => {
        stream.write = write => writes.push(write);

        args.lnd = {router: {htlcInterceptor: () => stream}};

        return subscribeToForwardRequests(args);
      },
    });

    deepStrictEqual({...got, writes}, {cancels: [], ...expected}, 'Events');

    return;
  });
});
