const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

const {subscribeToMessages} = require('./../../../lnd_methods');
const {subscriptionEvents} = require('./../macros');

const listenerFailure = {event: 'error', data: [503, 'ListenerFailure']};
const makeMessage = overrides => ({
  custom_records: {},
  encrypted_recipient_data: Buffer.from('aabb', 'hex'),
  onion: Buffer.from('ccdd', 'hex'),
  path_key: Buffer.alloc(33, 2),
  peer: Buffer.alloc(33, 3),
  reply_path: null,
  ...overrides,
});
const makeReceived = overrides => ({
  event: 'message_received',
  data: {
    encrypted: 'aabb',
    key: Buffer.alloc(33, 2).toString('hex'),
    message: undefined,
    onion: 'ccdd',
    reply: undefined,
    via: Buffer.alloc(33, 3).toString('hex'),
    ...overrides,
  },
});
const recordKey = type => {
  const key = Buffer.alloc(8);

  key.writeBigUInt64LE(BigInt(type));

  return key.toString('latin1');
};
const rpcError = new Error('RPC error');
const unsupportedError = {
  details: 'unknown method SubscribeOnionMessages for service lnrpc.Lightning',
};

const tests = [
  {
    args: {},
    description: 'An authenticated LND is required to subscribe to messages',
    error: 'ExpectedAuthenticatedLndToSubscribeToMessages',
  },
  {
    args: {lnd: {}},
    description: 'A default LND is required to subscribe to messages',
    error: 'ExpectedAuthenticatedLndToSubscribeToMessages',
  },
  {
    args: {lnd: {default: {}}},
    description: 'An LND with the method is required to subscribe to messages',
    error: 'ExpectedAuthenticatedLndToSubscribeToMessages',
  },
  {
    args: {},
    description: 'Onion messages are mapped and emitted without a reply path',
    expected: {events: [makeReceived({})]},
  },
  {
    args: {},
    description: 'Onion messages include a mapped payload message',
    expected: {
      events: [makeReceived({message: {type: '65537', value: 'eeff'}})],
    },
    stream: [['data', makeMessage({
      custom_records: {[recordKey('65537')]: Buffer.from('eeff', 'hex')},
    })]],
  },
  {
    args: {},
    description: 'Onion messages include a mapped reply path',
    expected: {
      events: [makeReceived({
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
      })],
    },
    stream: [['data', makeMessage({
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
    })]],
  },
  {
    args: {},
    description: 'Onion messages with multiple payload records are ignored',
    expected: {events: []},
    stream: [['data', makeMessage({
      custom_records: {
        [recordKey('65537')]: Buffer.from('00', 'hex'),
        [recordKey('65539')]: Buffer.from('01', 'hex'),
      },
    })]],
  },
  {
    args: {},
    description: 'A throwing listener is reported without canceling the RPC',
    expected: {
      events: [
        makeReceived({}),
        listenerFailure,
        makeReceived({}),
        listenerFailure,
      ],
    },
    stream: [['data', makeMessage({})], ['data', makeMessage({})]],
    throwing: ['message_received'],
  },
  {
    args: {},
    description: 'Invalid onion messages emit an error and cancel',
    expected: {
      cancels: ['cancel'],
      events: [{
        event: 'error',
        data: [503, 'ExpectedPeerPublicKeyBytesToDeriveOnionMessage'],
      }],
    },
    stream: [['data', makeMessage({peer: null})]],
  },
  {
    args: {},
    description: 'Onion messages missing data emit an error and cancel',
    expected: {
      cancels: ['cancel'],
      events: [{
        event: 'error',
        data: [503, 'ExpectedRpcMessageToDeriveOnionMessage'],
      }],
    },
    stream: [['data', null]],
  },
  {
    args: {},
    description: 'Onion messages missing records emit an error and cancel',
    expected: {
      cancels: ['cancel'],
      events: [{
        event: 'error',
        data: [503, 'ExpectedCustomRecordsToDeriveOnionMessage'],
      }],
    },
    stream: [['data', makeMessage({custom_records: undefined})]],
  },
  {
    args: {},
    description: 'An unsupported LND version error is emitted and cancels',
    expected: {
      cancels: ['cancel'],
      events: [{
        event: 'error',
        data: [501, 'SubscribeOnionMessagesMethodUnsupported'],
      }],
    },
    stream: [['error', unsupportedError]],
  },
  {
    args: {},
    description: 'RPC errors are forwarded and cancel the onion subscription',
    expected: {
      cancels: ['cancel'],
      events: [{event: 'error', data: rpcError}],
    },
    stream: [['error', rpcError]],
  },
  {
    args: {},
    description: 'Errors without error listeners still cancel the RPC',
    expected: {cancels: ['cancel'], events: []},
    listening: ['message_received'],
    stream: [['data', makeMessage({peer: null})]],
  },
  {
    args: {},
    description: 'Onion subscription status and end events are forwarded',
    expected: {
      events: [
        {event: 'status', data: {code: 0}},
        {event: 'end', data: undefined},
      ],
    },
    stream: [['status', {code: 0}], ['end']],
  },
  {
    args: {},
    description: 'Removing the last message listener cancels the subscription',
    expected: {cancels: ['cancel'], events: []},
    removing: ['message_received'],
    stream: [],
    throwing: ['message_received'],
  },
];

tests.forEach(({args, description, error, expected, ...scenario}) => {
  return test(description, async () => {
    if (!!error) {
      throws(() => subscribeToMessages(args), new Error(error), 'Got error');

      return;
    }

    const requests = [];

    const got = await subscriptionEvents({
      ...scenario,
      events: ['end', 'error', 'message_received', 'status'],
      stream: scenario.stream || [['data', makeMessage({})]],
      subscribe: stream => {
        args.lnd = {
          default: {
            subscribeOnionMessages: request => {
              requests.push(request);

              return stream;
            },
          },
        };

        return subscribeToMessages(args);
      },
    });

    deepStrictEqual(
      {...got, requests},
      {cancels: [], requests: [{}], ...expected},
      'Got expected events'
    );

    return;
  });
});
