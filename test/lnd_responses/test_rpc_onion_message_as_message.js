const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

const {rpcOnionMessageAsMessage} = require('./../../lnd_responses');

const recordKey = type => {
  const key = Buffer.alloc(8);

  key.writeBigUInt64LE(BigInt(type));

  return key.toString('latin1');
};

const makeReply = overrides => ({
  blinded_hops: [
    {
      blinded_node: Buffer.alloc(33, 1),
      encrypted_data: Buffer.from('0203', 'hex'),
    },
    {
      blinded_node: Buffer.alloc(33, 4),
      encrypted_data: Buffer.from('0506', 'hex'),
    },
  ],
  blinding_point: Buffer.alloc(33, 7),
  introduction_node: Buffer.from(`02${'08'.repeat(32)}`, 'hex'),
  ...overrides,
});

const makeArgs = overrides => ({
  custom_records: {[recordKey('65537')]: Buffer.from('0001', 'hex')},
  encrypted_recipient_data: Buffer.from('0405', 'hex'),
  onion: Buffer.from('0607', 'hex'),
  path_key: Buffer.alloc(33, 9),
  peer: Buffer.alloc(33, 10),
  reply_path: makeReply({}),
  ...overrides,
});

const makeExpectedReply = overrides => ({
  inbound: [
    {encrypted_data: '0203', relay_key: '01'.repeat(33)},
    {encrypted_data: '0506', relay_key: '04'.repeat(33)},
  ],
  introduction_edge: undefined,
  introduction_node: `02${'08'.repeat(32)}`,
  key: '07'.repeat(33),
  ...overrides,
});

const makeExpected = overrides => ({
  encrypted: '0405',
  key: '09'.repeat(33),
  message: {type: '65537', value: '0001'},
  onion: '0607',
  reply: makeExpectedReply({}),
  via: '0a'.repeat(33),
  ...overrides,
});

const tests = [
  {
    args: undefined,
    description: 'An RPC onion message is required',
    error: 'ExpectedRpcMessageToDeriveOnionMessage',
  },
  {
    args: null,
    description: 'An RPC onion message cannot be null',
    error: 'ExpectedRpcMessageToDeriveOnionMessage',
  },
  {
    args: makeArgs({custom_records: undefined}),
    description: 'Custom records cannot be missing',
    error: 'ExpectedCustomRecordsToDeriveOnionMessage',
  },
  {
    args: makeArgs({custom_records: null}),
    description: 'Custom records cannot be null',
    error: 'ExpectedCustomRecordsToDeriveOnionMessage',
  },
  {
    args: makeArgs({custom_records: []}),
    description: 'Custom records cannot be array',
    error: 'ExpectedCustomRecordsToDeriveOnionMessage',
  },
  {
    args: makeArgs({custom_records: Buffer.alloc(0)}),
    description: 'Custom records cannot be buffer',
    error: 'ExpectedCustomRecordsToDeriveOnionMessage',
  },
  {
    args: makeArgs({custom_records: 'records'}),
    description: 'Custom records cannot be string',
    error: 'ExpectedCustomRecordsToDeriveOnionMessage',
  },
  {
    args: makeArgs({custom_records: {[recordKey('65537')]: undefined}}),
    description: 'Custom record values must be buffers: undefined',
    error: 'ExpectedCustomRecordValueBufferToDeriveOnionMessage',
  },
  {
    args: makeArgs({custom_records: {[recordKey('65537')]: '00'}}),
    description: 'Custom record values must be buffers: 00',
    error: 'ExpectedCustomRecordValueBufferToDeriveOnionMessage',
  },
  {
    args: makeArgs({custom_records: {[recordKey('65537')]: new Uint8Array(1)}}),
    description: 'Custom record values must be buffers: 0',
    error: 'ExpectedCustomRecordValueBufferToDeriveOnionMessage',
  },
  {
    args: makeArgs({
      custom_records: {
        [recordKey('65537')]: Buffer.from('0001', 'hex'),
        [recordKey('65539')]: Buffer.from('0203', 'hex'),
      },
    }),
    description: 'Only a single payload record is expected',
    error: 'ExpectedSinglePayloadRecordToDeriveOnionMessage',
  },
  {
    args: makeArgs({encrypted_recipient_data: undefined}),
    description: 'encrypted_recipient_data must be a buffer: undefined',
    error: 'ExpectedEncryptedRecipientDataToDeriveOnionMessage',
  },
  {
    args: makeArgs({encrypted_recipient_data: '00'}),
    description: 'encrypted_recipient_data must be a buffer: 00',
    error: 'ExpectedEncryptedRecipientDataToDeriveOnionMessage',
  },
  {
    args: makeArgs({onion: undefined}),
    description: 'onion must be a buffer: undefined',
    error: 'ExpectedOnionPacketToDeriveOnionMessage',
  },
  {
    args: makeArgs({onion: '00'}),
    description: 'onion must be a buffer: 00',
    error: 'ExpectedOnionPacketToDeriveOnionMessage',
  },
  {
    args: makeArgs({path_key: undefined}),
    description: 'path_key must be a buffer: undefined',
    error: 'ExpectedPathKeyToDeriveOnionMessage',
  },
  {
    args: makeArgs({path_key: '00'}),
    description: 'path_key must be a buffer: 00',
    error: 'ExpectedPathKeyToDeriveOnionMessage',
  },
  {
    args: makeArgs({peer: undefined}),
    description: 'peer must be a buffer: undefined',
    error: 'ExpectedPeerPublicKeyBytesToDeriveOnionMessage',
  },
  {
    args: makeArgs({peer: '00'}),
    description: 'peer must be a buffer: 00',
    error: 'ExpectedPeerPublicKeyBytesToDeriveOnionMessage',
  },
  {
    args: makeArgs({reply_path: makeReply({blinded_hops: undefined})}),
    description: 'Reply blinded hops cannot be missing',
    error: 'ExpectedReplyBlindedHopsArrayToDeriveOnionMessage',
  },
  {
    args: makeArgs({reply_path: makeReply({blinded_hops: null})}),
    description: 'Reply blinded hops cannot be null',
    error: 'ExpectedReplyBlindedHopsArrayToDeriveOnionMessage',
  },
  {
    args: makeArgs({reply_path: makeReply({blinded_hops: 'hops'})}),
    description: 'Reply blinded hops cannot be a string',
    error: 'ExpectedReplyBlindedHopsArrayToDeriveOnionMessage',
  },
  {
    args: makeArgs({reply_path: makeReply({blinded_hops: {}})}),
    description: 'Reply blinded hops cannot be an object',
    error: 'ExpectedReplyBlindedHopsArrayToDeriveOnionMessage',
  },
  {
    args: makeArgs({reply_path: {}}),
    description: 'An empty reply path object is missing its blinded hops',
    error: 'ExpectedReplyBlindedHopsArrayToDeriveOnionMessage',
  },
  {
    args: makeArgs({reply_path: makeReply({blinding_point: undefined})}),
    description: 'A reply blinding point is required',
    error: 'ExpectedReplyBlindingPointToDeriveOnionMessage',
  },
  {
    args: makeArgs({reply_path: makeReply({blinding_point: '00'})}),
    description: 'A reply blinding point cannot be a string',
    error: 'ExpectedReplyBlindingPointToDeriveOnionMessage',
  },
  {
    args: makeArgs({reply_path: makeReply({introduction_node: undefined})}),
    description: 'Reply introduction_node must be a buffer: undefined',
    error: 'ExpectedReplyIntroductionNodeToDeriveOnionMessage',
  },
  {
    args: makeArgs({reply_path: makeReply({introduction_node: '00'})}),
    description: 'Reply introduction_node must be a buffer: 00',
    error: 'ExpectedReplyIntroductionNodeToDeriveOnionMessage',
  },
  {
    args: makeArgs({
      reply_path: makeReply({introduction_node: Buffer.alloc(33, 8)}),
    }),
    description: 'A reply introduction node cannot be an unknown type byte',
    error: 'ExpectedReplyIntroductionKeyOrEdgeToDeriveOnionMessage',
  },
  {
    args: makeArgs({
      reply_path: makeReply({introduction_node: Buffer.alloc(33)}),
    }),
    description: 'A reply introduction edge cannot have a key length',
    error: 'ExpectedReplyIntroductionKeyOrEdgeToDeriveOnionMessage',
  },
  {
    args: makeArgs({
      reply_path: makeReply({introduction_node: Buffer.alloc(9, 2)}),
    }),
    description: 'A reply introduction key cannot have an edge length',
    error: 'ExpectedReplyIntroductionKeyOrEdgeToDeriveOnionMessage',
  },
  {
    args: makeArgs({
      reply_path: makeReply({introduction_node: Buffer.alloc(0)}),
    }),
    description: 'A reply introduction node cannot be an empty buffer',
    error: 'ExpectedReplyIntroductionKeyOrEdgeToDeriveOnionMessage',
  },
  {
    args: makeArgs({reply_path: makeReply({blinded_hops: [null]})}),
    description: 'A reply hop cannot be null',
    error: 'ExpectedReplyBlindedNodeToDeriveOnionMessage',
  },
  {
    args: makeArgs({
      reply_path: makeReply({
        blinded_hops: [{
          blinded_node: undefined,
          encrypted_data: Buffer.alloc(1),
        }],
      }),
    }),
    description: 'Reply hop blinded_node must be a buffer: undefined',
    error: 'ExpectedReplyBlindedNodeToDeriveOnionMessage',
  },
  {
    args: makeArgs({
      reply_path: makeReply({
        blinded_hops: [{
          blinded_node: '00',
          encrypted_data: Buffer.alloc(1),
        }],
      }),
    }),
    description: 'Reply hop blinded_node must be a buffer: 00',
    error: 'ExpectedReplyBlindedNodeToDeriveOnionMessage',
  },
  {
    args: makeArgs({
      reply_path: makeReply({
        blinded_hops: [{
          blinded_node: Buffer.alloc(33, 1),
          encrypted_data: undefined,
        }],
      }),
    }),
    description: 'Reply hop encrypted_data must be a buffer: undefined',
    error: 'ExpectedReplyEncryptedDataToDeriveOnionMessage',
  },
  {
    args: makeArgs({
      reply_path: makeReply({
        blinded_hops: [{
          blinded_node: Buffer.alloc(33, 1),
          encrypted_data: '00',
        }],
      }),
    }),
    description: 'Reply hop encrypted_data must be a buffer: 00',
    error: 'ExpectedReplyEncryptedDataToDeriveOnionMessage',
  },
  {
    args: makeArgs({}),
    description: 'An RPC onion message maps its payload and reply hops',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({
      reply_path: makeReply({
        introduction_node: Buffer.from(`03${'08'.repeat(32)}`, 'hex'),
      }),
    }),
    description: 'A reply introduction node key can have an odd prefix',
    expected: makeExpected({
      reply: makeExpectedReply({introduction_node: `03${'08'.repeat(32)}`}),
    }),
  },
  {
    args: makeArgs({
      reply_path: makeReply({
        introduction_node: Buffer.from('000aae600004d20003', 'hex'),
      }),
    }),
    description: 'A reply introduction can be an edge to the first node',
    expected: makeExpected({
      reply: makeExpectedReply({
        introduction_edge: '700000x1234x3x0',
        introduction_node: undefined,
      }),
    }),
  },
  {
    args: makeArgs({
      reply_path: makeReply({
        introduction_node: Buffer.from('010aae600004d20003', 'hex'),
      }),
    }),
    description: 'A reply introduction can be an edge to the second node',
    expected: makeExpected({
      reply: makeExpectedReply({
        introduction_edge: '700000x1234x3x1',
        introduction_node: undefined,
      }),
    }),
  },
  {
    args: makeArgs({reply_path: null}),
    description: 'An RPC onion message can have a null reply path',
    expected: makeExpected({reply: undefined}),
  },
  {
    args: makeArgs({reply_path: undefined}),
    description: 'An RPC onion message can omit its reply path',
    expected: makeExpected({reply: undefined}),
  },
  {
    args: makeArgs({reply_path: makeReply({blinded_hops: []})}),
    description: 'A reply path with no blinded hops signals no reply path',
    expected: makeExpected({reply: undefined}),
  },
  {
    args: makeArgs({reply_path: {blinded_hops: []}}),
    description: 'A reply path with only empty blinded hops has no reply',
    expected: makeExpected({reply: undefined}),
  },
  {
    args: makeArgs({
      reply_path: {
        blinded_hops: [],
        blinding_point: Buffer.alloc(0),
        introduction_node: Buffer.alloc(0),
      },
    }),
    description: 'An RPC default empty reply path signals no reply path',
    expected: makeExpected({reply: undefined}),
  },
  {
    args: makeArgs({custom_records: {}}),
    description: 'An RPC onion message can have no payload record',
    expected: makeExpected({message: undefined}),
  },
  {
    args: makeArgs({custom_records: {'': Buffer.from('ff', 'hex')}}),
    description: 'An empty custom record key is treated as type zero',
    expected: makeExpected({message: {type: '0', value: 'ff'}}),
  },
  {
    args: makeArgs({
      custom_records: {[recordKey('0')]: Buffer.from('ff', 'hex')},
    }),
    description: 'A record type keeps uint64 precision: 0',
    expected: makeExpected({message: {type: '0', value: 'ff'}}),
  },
  {
    args: makeArgs({
      custom_records: {
        [recordKey('9007199254740993')]: Buffer.from('ff', 'hex'),
      },
    }),
    description: 'A record type keeps uint64 precision: 9007199254740993',
    expected: makeExpected({
      message: {type: '9007199254740993', value: 'ff'},
    }),
  },
  {
    args: makeArgs({
      custom_records: {
        [recordKey('18446744073709551615')]: Buffer.from('ff', 'hex'),
      },
    }),
    description: 'A record type keeps uint64 precision: 18446744073709551615',
    expected: makeExpected({
      message: {type: '18446744073709551615', value: 'ff'},
    }),
  },
  {
    args: makeArgs({
      custom_records: {
        [recordKey('4050765991979987505')]: Buffer.from('ff', 'hex'),
      },
    }),
    description: 'A record type keeps uint64 precision: 4050765991979987505',
    expected: makeExpected({
      message: {type: '4050765991979987505', value: 'ff'},
    }),
  },
  {
    description: 'Mapping an RPC onion message does not mutate its input',
    run: () => {
      const args = makeArgs({});
      const original = makeArgs({});

      rpcOnionMessageAsMessage(args);

      deepStrictEqual(args, original, 'RPC fields and buffers are unchanged');

      return;
    },
  },
  {
    args: makeArgs({custom_records: {'12345678': Buffer.from('ff', 'hex')}}),
    description: 'Decoded RPC map keys produce decimal types: ascii digits',
    expected: makeExpected({
      message: {type: '4050765991979987505', value: 'ff'},
    }),
  },
  {
    args: makeArgs({
      custom_records: {
        '\x01\x00\x01\x00\x00\x00\x00\x00': Buffer.from('ff', 'hex'),
      },
    }),
    description: 'Decoded RPC map keys produce decimal types: 65537',
    expected: makeExpected({message: {type: '65537', value: 'ff'}}),
  },
  {
    args: makeArgs({
      custom_records: {
        '\x01\x00\x00\x00\x00\x00\x20\x00': Buffer.from('ff', 'hex'),
      },
    }),
    description: 'Decoded RPC map keys produce decimal types: above 2^53',
    expected: makeExpected({message: {type: '9007199254740993', value: 'ff'}}),
  },
  {
    args: makeArgs({
      custom_records: {
        '\xff\xff\xff\xff\xff\xff\xff\xff': Buffer.from('ff', 'hex'),
      },
    }),
    description: 'Decoded RPC map keys produce decimal types: max uint64',
    expected: makeExpected({
      message: {type: '18446744073709551615', value: 'ff'},
    }),
  },
];

tests.forEach(({args, description, error, expected, run}) => {
  return test(description, () => {
    if (!!run) {
      return run();
    }

    if (!!error) {
      throws(() => rpcOnionMessageAsMessage(args), new Error(error), 'Got err');
    } else {
      deepStrictEqual(rpcOnionMessageAsMessage(args), expected, 'Got message');
    }

    return;
  });
});
