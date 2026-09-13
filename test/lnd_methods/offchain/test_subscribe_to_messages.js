const {deepStrictEqual} = require('node:assert').strict;
const EventEmitter = require('node:events');
const test = require('node:test');
const {throws} = require('node:assert').strict;

const {subscribeToMessages} = require('./../../../lnd_methods');

const unsupportedError = {
  details: 'unknown method SubscribeOnionMessages for service lnrpc.Lightning',
};

const makeLnd = () => {
  const canceled = [];
  const requests = [];
  const subscription = new EventEmitter();

  subscription.cancel = () => canceled.push(true);

  return {
    canceled,
    lnd: {
      default: {
        subscribeOnionMessages: args => {
          requests.push(args);

          return subscription;
        },
      },
    },
    requests,
    subscription,
  };
};

const recordKey = type => {
  const key = Buffer.alloc(8);

  key.writeBigUInt64LE(BigInt(type));

  return key.toString('latin1');
};

const makeMessage = overrides => ({
  custom_records: {},
  encrypted_recipient_data: Buffer.from('aabb', 'hex'),
  onion: Buffer.from('ccdd', 'hex'),
  path_key: Buffer.alloc(33, 2),
  peer: Buffer.alloc(33, 3),
  reply_path: null,
  ...overrides,
});

const tests = [
  {
    description: 'Onion messages are mapped and emitted without a reply path',
    expected: {
      encrypted: 'aabb',
      key: Buffer.alloc(33, 2).toString('hex'),
      message: undefined,
      onion: 'ccdd',
      reply: undefined,
      via: Buffer.alloc(33, 3).toString('hex'),
    },
    message: makeMessage({}),
  },
  {
    description: 'Onion messages include a mapped payload message',
    expected: {
      encrypted: 'aabb',
      key: Buffer.alloc(33, 2).toString('hex'),
      message: {type: '65537', value: 'eeff'},
      onion: 'ccdd',
      reply: undefined,
      via: Buffer.alloc(33, 3).toString('hex'),
    },
    message: makeMessage({
      custom_records: {[recordKey('65537')]: Buffer.from('eeff', 'hex')},
    }),
  },
  {
    description: 'Onion messages include a mapped reply path',
    expected: {
      encrypted: 'aabb',
      key: Buffer.alloc(33, 2).toString('hex'),
      message: undefined,
      onion: 'ccdd',
      reply: {
        inbound: [
          {
            encrypted_data: '0102',
            relay_key: Buffer.alloc(33, 4).toString('hex'),
          },
          {
            encrypted_data: '0304',
            relay_key: Buffer.alloc(33, 5).toString('hex'),
          },
        ],
        introduction_edge: undefined,
        introduction_node: `02${'06'.repeat(32)}`,
        key: Buffer.alloc(33, 7).toString('hex'),
      },
      via: Buffer.alloc(33, 3).toString('hex'),
    },
    message: makeMessage({
      reply_path: {
        blinded_hops: [
          {
            blinded_node: Buffer.alloc(33, 4),
            encrypted_data: Buffer.from('0102', 'hex'),
          },
          {
            blinded_node: Buffer.alloc(33, 5),
            encrypted_data: Buffer.from('0304', 'hex'),
          },
        ],
        blinding_point: Buffer.alloc(33, 7),
        introduction_node: Buffer.from(`02${'06'.repeat(32)}`, 'hex'),
      },
    }),
  },
  {
    description: 'An authenticated LND is required to subscribe to messages',
    run: () => {
      [{}, {lnd: {}}, {lnd: {default: {}}}].forEach(args => {
        throws(
          () => subscribeToMessages(args),
          new Error('ExpectedAuthenticatedLndToSubscribeToMessages'),
          'Expected a valid LND');
      });
    },
  },
  {
    description: 'Onion messages with multiple payload records are ignored',
    run: () => {
      const {canceled, lnd, subscription} = makeLnd();
      const errors = [];
      const received = [];
      const sub = subscribeToMessages({lnd});

      sub.on('error', err => errors.push(err));
      sub.on('message_received', message => received.push(message));

      subscription.emit('data', makeMessage({
        custom_records: {
          [recordKey('65537')]: Buffer.from('00', 'hex'),
          [recordKey('65539')]: Buffer.from('01', 'hex'),
        },
      }));

      deepStrictEqual(errors, [], 'An invalid message is not an error');
      deepStrictEqual(received, [], 'An invalid message is not emitted');
      deepStrictEqual(canceled, [], 'An invalid message keeps the RPC');
    },
  },
  {
    description: 'Invalid onion messages emit an error and cancel',
    run: () => {
      const {canceled, lnd, subscription} = makeLnd();
      const errors = [];
      const received = [];
      const sub = subscribeToMessages({lnd});

      sub.on('error', err => errors.push(err));
      sub.on('message_received', message => received.push(message));

      subscription.emit('data', makeMessage({peer: null}));

      deepStrictEqual(errors, [[
        503,
        'ExpectedPeerPublicKeyBytesToDeriveOnionMessage',
      ]], 'Received the mapping error');
      deepStrictEqual(received, [], 'No malformed message was emitted');
      deepStrictEqual(canceled, [true], 'The RPC subscription was canceled');
    },
  },
  {
    description: 'Onion messages missing fields emit an error and cancel',
    run: () => {
      const invalid = [
        {data: null, error: 'ExpectedRpcMessageToDeriveOnionMessage'},
        {
          data: makeMessage({custom_records: undefined}),
          error: 'ExpectedCustomRecordsToDeriveOnionMessage',
        },
      ];

      invalid.forEach(({data, error}) => {
        const {canceled, lnd, subscription} = makeLnd();
        const errors = [];
        const sub = subscribeToMessages({lnd});

        sub.on('error', err => errors.push(err));

        subscription.emit('data', data);

        deepStrictEqual(errors, [[503, error]], 'Received the mapping error');
        deepStrictEqual(canceled, [true], 'The RPC subscription was canceled');
      });
    },
  },
  {
    description: 'An unsupported LND version error is emitted and cancels',
    run: () => {
      const {canceled, lnd, subscription} = makeLnd();
      const errors = [];
      const sub = subscribeToMessages({lnd});

      sub.on('error', err => errors.push(err));

      subscription.emit('error', unsupportedError);

      deepStrictEqual(errors, [[
        501,
        'SubscribeOnionMessagesMethodUnsupported',
      ]], 'Received the unsupported method error');
      deepStrictEqual(canceled, [true], 'The RPC subscription was canceled');
    },
  },
  {
    description: 'RPC errors are forwarded and cancel the onion subscription',
    run: () => {
      const {canceled, lnd, subscription} = makeLnd();
      const error = new Error('RPC error');
      const errors = [];
      const sub = subscribeToMessages({lnd});

      sub.on('error', err => errors.push(err));

      subscription.emit('error', error);

      deepStrictEqual(errors, [error], 'Received the original RPC error');
      deepStrictEqual(canceled, [true], 'The RPC subscription was canceled');
    },
  },
  {
    description: 'Errors without error listeners still cancel the RPC',
    run: () => {
      const {canceled, lnd, subscription} = makeLnd();

      subscribeToMessages({lnd});

      subscription.emit('data', makeMessage({peer: null}));

      deepStrictEqual(canceled, [true], 'The RPC subscription was canceled');
    },
  },
  {
    description: 'Onion subscription status and end events are forwarded',
    run: () => {
      const {lnd, subscription} = makeLnd();
      const events = [];
      const status = {code: 0};
      const sub = subscribeToMessages({lnd});

      sub.on('status', data => events.push({event: 'status', data}));
      sub.on('end', () => events.push({event: 'end'}));

      subscription.emit('status', status);
      subscription.emit('end');

      deepStrictEqual(events, [
        {event: 'status', data: status},
        {event: 'end'},
      ], 'Received the RPC lifecycle events');
    },
  },
  {
    description: 'Removing the last message listener cancels the subscription',
    run: () => {
      const {canceled, lnd} = makeLnd();
      const first = () => {};
      const second = () => {};
      const sub = subscribeToMessages({lnd});

      sub.on('message_received', first);
      sub.on('message_received', second);
      sub.removeListener('message_received', first);

      deepStrictEqual(canceled, [], 'A remaining listener keeps the RPC');

      sub.removeListener('message_received', second);

      deepStrictEqual(canceled, [true], 'Removing all listeners cancels');
    },
  },
];

tests.forEach(({description, expected, message, run}) => {
  return test(description, () => {
    if (!!run) {
      return run();
    }

    const {canceled, lnd, requests, subscription} = makeLnd();
    const received = [];
    const sub = subscribeToMessages({lnd});

    sub.on('message_received', data => received.push(data));

    subscription.emit('data', message);

    deepStrictEqual(requests, [{}], 'Requested the onion message subscription');
    deepStrictEqual(received, [expected], 'Received the mapped message');
    deepStrictEqual(canceled, [], 'Valid messages keep the RPC active');

    return;
  });
});
