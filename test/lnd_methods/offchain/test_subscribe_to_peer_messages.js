const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

const {subscribeToPeerMessages} = require('./../../../lnd_methods');
const {subscriptionEvents} = require('./../macros');

const cancelled = {details: 'Cancelled on client'};
const listenerFailure = {event: 'error', data: [503, 'ListenerFailure']};
const makeMessage = overrides => {
  const message = {
    data: Buffer.alloc(1),
    peer: Buffer.alloc(33, 3),
    type: 44444,
  };

  Object.keys(overrides).forEach(k => message[k] = overrides[k]);

  return message;
};
const received = {
  event: 'message_received',
  data: {
    message: '00',
    public_key: Buffer.alloc(33, 3).toString('hex'),
    type: 44444,
  },
};

const tests = [
  {
    args: {},
    description: 'LND is required to subscribe to peer messages',
    error: 'ExpectedLndToSubscribeToPeerMessages',
  },
  {
    args: {},
    description: 'Stream end, status and errors are relayed',
    expected: {
      cancels: ['cancel'],
      events: [
        {event: 'end', data: undefined},
        {event: 'status', data: 'status'},
        {event: 'error', data: 'err'},
      ],
    },
    stream: [['end'], ['status', 'status'], ['error', 'err']],
  },
  {
    args: {},
    description: 'A cancelled stream stops relaying messages',
    expected: {
      cancels: ['cancel'],
      events: [{event: 'error', data: cancelled}],
    },
    stream: [['error', cancelled], ['data', makeMessage({})]],
  },
  {
    args: {},
    description: 'A peer is expected',
    expected: {
      cancels: ['cancel'],
      events: [{
        event: 'error',
        data: [503, 'ExpectedPeerPublicKeyBytesToDerivePeerMessage'],
      }],
    },
    stream: [['data', makeMessage({peer: null})]],
  },
  {
    args: {},
    description: 'Peer message event emitted',
    expected: {events: [received]},
  },
  {
    args: {},
    description: 'A throwing listener is reported without ending the stream',
    expected: {
      events: [received, listenerFailure, received, listenerFailure],
    },
    stream: [['data', makeMessage({})], ['data', makeMessage({})]],
    throwing: ['message_received'],
  },
  {
    args: {},
    description: 'Removing the last message listener cancels the stream',
    expected: {cancels: ['cancel'], events: []},
    removing: ['message_received'],
    stream: [],
  },
];

tests.forEach(({args, description, error, expected, ...scenario}) => {
  return test(description, async () => {
    if (!!error) {
      throws(() => subscribeToPeerMessages(args), new Error(error), 'Got err');

      return;
    }

    const got = await subscriptionEvents({
      ...scenario,
      events: ['end', 'error', 'message_received', 'status'],
      stream: scenario.stream || [['data', makeMessage({})]],
      subscribe: stream => {
        args.lnd = {default: {SubscribeCustomMessages: ({}) => stream}};

        return subscribeToPeerMessages(args);
      },
    });

    deepStrictEqual(got, {cancels: [], ...expected}, 'Got expected events');

    return;
  });
});
