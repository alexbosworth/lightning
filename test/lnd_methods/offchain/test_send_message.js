const {deepStrictEqual} = require('node:assert').strict;
const {match} = require('node:assert').strict;
const {notStrictEqual} = require('node:assert').strict;
const {ok} = require('node:assert').strict;
const {rejects} = require('node:assert').strict;
const test = require('node:test');

const {blindedPathFromHops} = require('bolt04');

const {sendMessage} = require('./../../../lnd_methods');

const hexAsBuffer = hex => Buffer.from(hex, 'hex');
const publicKeys = [
  '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
  '02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5',
  '02f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9',
];
const inbound = blindedPathFromHops({hops: publicKeys.slice(1)});
const unsupportedError = {
  details: 'unknown method SendOnionMessage for service lnrpc.Lightning',
};

const makeLnd = ({err, requests}) => ({
  default: {
    sendOnionMessage: (args, cbk) => {
      requests.push(args);

      return setImmediate(() => cbk(err));
    },
  },
});

const makeArgs = overrides => ({
  inbound: inbound.path,
  key: inbound.key,
  message: {type: '65537', value: '00'},
  outbound: [publicKeys[1]],
  ...overrides,
});

const assertSentMessage = ({expected, requests, result}) => {
  deepStrictEqual(requests.length, expected.requests, 'Sent one message');

  const [request] = requests;

  deepStrictEqual(
    Object.keys(request).sort(),
    ['onion', 'path_key', 'peer'],
    'Got expected RPC fields'
  );

  deepStrictEqual(request.peer, hexAsBuffer(expected.peer), 'Peer');
  ok(Buffer.isBuffer(request.onion), 'Onion is encoded as bytes');
  ok(request.onion.length, 'Onion is not empty');
  ok(Buffer.isBuffer(request.path_key), 'Path key is encoded as bytes');
  match(request.path_key.toString('hex'), /^0[23][0-9a-f]{64}$/, 'Path key');

  if (!!expected.path_key) {
    deepStrictEqual(
      request.path_key,
      hexAsBuffer(expected.path_key),
      'Inbound key'
    );
  } else {
    notStrictEqual(
      request.path_key.toString('hex'),
      expected.not_path_key,
      'Relay key'
    );
  }

  if (!!expected.reply) {
    deepStrictEqual(Object.keys(result), ['reply'], 'Got only reply result');
    match(result.reply, expected.reply, 'Got reply path identifier');
  } else {
    deepStrictEqual(result, {reply: expected.reply}, 'No reply path id');
  }

  return;
};

const tests = [
  {
    args: requests => makeArgs({
      inbound: undefined,
      lnd: makeLnd({requests}),
    }),
    description: 'Inbound hops are required to send a message',
    error: [400, 'ExpectedArrayOfInboundRelayKeysToSendMessage'],
    expected: {requests: 0},
  },
  {
    args: requests => makeArgs({key: undefined, lnd: makeLnd({requests})}),
    description: 'A path key is required to send a message',
    error: [400, 'ExpectedMessagePathKeyToSendMessage'],
    expected: {requests: 0},
  },
  {
    args: () => makeArgs({lnd: undefined}),
    description: 'LND is required to send a message',
    error: [400, 'ExpectedAuthenticatedLndToSendMessageToNode'],
    expected: {requests: 0},
  },
  {
    args: () => makeArgs({lnd: {default: {}}}),
    description: 'The onion message RPC is required to send a message',
    error: [400, 'ExpectedAuthenticatedLndToSendMessageToNode'],
    expected: {requests: 0},
  },
  {
    args: requests => makeArgs({lnd: makeLnd({requests}), message: '00'}),
    description: 'A message must be an object with a type',
    error: [400, 'ExpectedMessageTypeNumberStringToSendMessage'],
    expected: {requests: 0},
  },
  {
    args: requests => makeArgs({
      lnd: makeLnd({requests}),
      message: {type: 65537, value: '00'},
    }),
    description: 'A message type must be a number string',
    error: [400, 'ExpectedMessageTypeNumberStringToSendMessage'],
    expected: {requests: 0},
  },
  {
    args: requests => makeArgs({
      lnd: makeLnd({requests}),
      message: {type: 'type', value: '00'},
    }),
    description: 'A message type must be numeric',
    error: [400, 'ExpectedMessageTypeNumberStringToSendMessage'],
    expected: {requests: 0},
  },
  {
    args: requests => makeArgs({
      lnd: makeLnd({requests}),
      message: {type: '65537', value: 'zz'},
    }),
    description: 'A message value must be hex encoded',
    error: [400, 'ExpectedHexEncodedMessageValueToSendMessage'],
    expected: {requests: 0},
  },
  {
    args: requests => makeArgs({
      lnd: makeLnd({requests}),
      message: {type: '65537', value: 0},
    }),
    description: 'A message value must be a hex string',
    error: [400, 'ExpectedHexEncodedMessageValueToSendMessage'],
    expected: {requests: 0},
  },
  {
    args: requests => makeArgs({
      lnd: makeLnd({requests}),
      outbound: undefined,
    }),
    description: 'Outbound hops are required to send a message',
    error: [400, 'ExpectedArrayOfOutboundRelaysToSendMessage'],
    expected: {requests: 0},
  },
  {
    args: requests => makeArgs({lnd: makeLnd({requests}), outbound: []}),
    description: 'An outbound peer is required to send a message',
    error: [400, 'ExpectedOutboundPeerToSendMessage'],
    expected: {requests: 0},
  },
  {
    args: requests => makeArgs({lnd: makeLnd({requests}), reply: 'reply'}),
    description: 'Reply hops must be an array',
    error: [400, 'ExpectedArrayOfReplyRelaysToSendMessage'],
    expected: {requests: 0},
  },
  {
    args: requests => makeArgs({inbound: [], lnd: makeLnd({requests})}),
    description: 'Onion encoding errors are returned without sending',
    error: [400, 'ExpectedValidHopsAndMessageToSendMessage', {
      err: new Error('ExpectedArrayOfInboundHopsToCreatePathOnion'),
    }],
    expected: {requests: 0},
  },
  {
    args: requests => makeArgs({
      lnd: makeLnd({requests}),
      message: {type: '4', value: '00'},
    }),
    description: 'A reserved payload type is rejected without sending',
    error: [400, 'ExpectedValidHopsAndMessageToSendMessage', {
      err: new Error('UnexpectedEncryptedDataRecordToCreatePathOnion'),
    }],
    expected: {requests: 0},
  },
  {
    args: requests => makeArgs({
      lnd: makeLnd({requests, err: unsupportedError}),
    }),
    description: 'An unsupported LND version error is returned',
    error: [501, 'SendOnionMessageMethodUnsupported'],
    expected: {requests: 1},
  },
  {
    args: requests => makeArgs({
      lnd: makeLnd({requests, err: {details: 'peer is not connected'}}),
    }),
    description: 'A disconnected outbound peer error is returned',
    error: [503, 'ExpectedConnectedOutboundPeerToSendMessage'],
    expected: {requests: 1},
  },
  {
    args: requests => makeArgs({
      lnd: makeLnd({requests, err: {details: 'peer exiting'}}),
    }),
    description: 'An exiting outbound peer error is returned',
    error: [503, 'ExpectedConnectedOutboundPeerToSendMessage'],
    expected: {requests: 1},
  },
  {
    args: requests => makeArgs({
      lnd: makeLnd({
        requests,
        err: {details: `peer ${publicKeys[1]} disconnected`},
      }),
    }),
    description: 'An outbound peer disconnecting error is returned',
    error: [503, 'ExpectedConnectedOutboundPeerToSendMessage'],
    expected: {requests: 1},
  },
  {
    args: requests => makeArgs({lnd: makeLnd({requests, err: 'err'})}),
    description: 'Unexpected message send errors are returned',
    error: [503, 'UnexpectedErrorSendingMessage', {err: 'err'}],
    expected: {requests: 1},
  },
  {
    description: 'A message returns its reply identifier via callback',
    run: async () => {
      const requests = [];
      const lnd = makeLnd({requests});
      const args = makeArgs({lnd, reply: [publicKeys[0]]});

      const result = await new Promise((resolve, reject) => {
        return sendMessage(args, (err, res) => {
          return !!err ? reject(err) : resolve(res);
        });
      });

      deepStrictEqual(requests.length, 1, 'Sent one message');
      deepStrictEqual(Object.keys(result), ['reply'], 'Got only reply result');
      match(result.reply, /^[0-9a-f]{64}$/, 'Got reply path identifier');

      return;
    },
  },
  {
    args: requests => makeArgs({lnd: makeLnd({requests})}),
    description: 'A message is sent directly to the introduction node',
    expected: {
      path_key: inbound.key,
      peer: publicKeys[1],
      reply: undefined,
      requests: 1,
    },
  },
  {
    args: requests => makeArgs({
      lnd: makeLnd({requests}),
      outbound: publicKeys.slice(0, 2),
    }),
    description: 'A message is sent through an outbound relay',
    expected: {
      not_path_key: inbound.key,
      peer: publicKeys[0],
      reply: undefined,
      requests: 1,
    },
  },
  {
    args: requests => makeArgs({lnd: makeLnd({requests}), message: undefined}),
    description: 'A message is sent without a payload',
    expected: {
      path_key: inbound.key,
      peer: publicKeys[1],
      reply: undefined,
      requests: 1,
    },
  },
  {
    args: requests => makeArgs({
      lnd: makeLnd({requests}),
      message: {type: '65537', value: ''},
    }),
    description: 'A message is sent with an empty payload value',
    expected: {
      path_key: inbound.key,
      peer: publicKeys[1],
      reply: undefined,
      requests: 1,
    },
  },
  {
    args: requests => makeArgs({
      lnd: makeLnd({requests}),
      message: {type: '64', value: '0001'},
    }),
    description: 'A message is sent with a known even payload type',
    expected: {
      path_key: inbound.key,
      peer: publicKeys[1],
      reply: undefined,
      requests: 1,
    },
  },
  {
    args: requests => makeArgs({
      lnd: makeLnd({requests}),
      reply: [publicKeys[0]],
    }),
    description: 'A message returns a reply identifier',
    expected: {
      path_key: inbound.key,
      peer: publicKeys[1],
      reply: /^[0-9a-f]{64}$/,
      requests: 1,
    },
  },
  {
    description: 'A message send error is returned via callback',
    run: async () => {
      const requests = [];
      const lnd = makeLnd({requests, err: 'err'});

      const result = await new Promise(resolve => {
        return sendMessage(makeArgs({lnd}), (err, res) => resolve({err, res}));
      });

      deepStrictEqual(result, {
        err: [503, 'UnexpectedErrorSendingMessage', {err: 'err'}],
        res: undefined,
      }, 'Got RPC error');

      deepStrictEqual(requests.length, 1, 'Attempted one message');

      return;
    },
  },
];

tests.forEach(({args, description, error, expected, run}) => {
  return test(description, async () => {
    if (!!run) {
      return run();
    }

    const requests = [];
    const input = args(requests);

    if (!!error) {
      await rejects(sendMessage(input), error, 'Got error');

      deepStrictEqual(requests.length, expected.requests, 'Got RPC calls');

      return;
    }

    const result = await sendMessage(input);

    return assertSentMessage({expected, requests, result});
  });
});
