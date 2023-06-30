const {deepStrictEqual} = require('node:assert').strict;
const {rejects} = require('node:assert').strict;
const test = require('node:test');

const {beginGroupSigningSession} = require('./../../../');

const makeLnd = (err, res) => {
  return {
    signer: {
      muSig2CreateSession: ({}, cbk) => cbk(err, res),
    },
    wallet: {
      deriveKey: ({}, cbk) => cbk(null, {
        key_loc: {key_index: 0},
        raw_key_bytes: Buffer.alloc(1),
      }),
    },
  };
};

const makeArgs = override => {
  const args = {
    lnd: makeLnd(null, {
      combined_key: Buffer.alloc(32),
      local_public_nonces: Buffer.alloc(66),
      session_id: Buffer.alloc(32),
      taproot_internal_key: Buffer.alloc(0),
    }),
    key_family: 0,
    key_index: 0,
    public_keys: [Buffer.alloc(33, 2).toString('hex')],
  };

  Object.keys(override || {}).forEach(key => args[key] = override[key]);

  return args;
};

const tests = [
  {
    args: makeArgs({lnd: undefined}),
    description: 'LND object is required',
    error: [400, 'ExpectedAuthenticatedLndToStartMuSig2Session'],
  },
  {
    args: makeArgs({key_family: undefined}),
    description: 'A key family is required',
    error: [400, 'ExpectedKeyFamilyToStartMuSig2Session'],
  },
  {
    args: makeArgs({key_index: undefined}),
    description: 'The key index is required',
    error: [400, 'ExpectedKeyIndexToStartMuSig2Session'],
  },
  {
    args: makeArgs({public_keys: undefined}),
    description: 'Public keys are required',
    error: [400, 'ExpectedArrayOfPublicKeysForMuSig2SessionStart'],
  },
  {
    args: makeArgs({public_keys: []}),
    description: 'Remote public keys are required',
    error: [400, 'ExpectedOtherPublicKeysForMuSig2SessionStart'],
  },
  {
    args: makeArgs({root_hash: 'root_hash'}),
    description: 'Root hash must be valid',
    error: [400, 'ExpectedHashWhenSpecifyingMuSig2ScriptRootHash'],
  },
  {
    args: makeArgs({
      lnd: makeLnd({
        details: 'unknown method MuSig2CreateSession for service signrpc.Signer',
      }),
    }),
    description: 'MuSig2 must be supported',
    error: [501, 'MuSig2BeginSigningSessionNotSupported'],
  },
  {
    args: makeArgs({lnd: makeLnd('err')}),
    description: 'Unexpected errors are passed back',
    error: [503, 'UnexpectedErrorCreatingMuSig2Session', {err: 'err'}],
  },
  {
    args: makeArgs({lnd: makeLnd(null, {})}),
    description: 'A valid response is expected',
    error: [503, 'ExpectedCombinedPublicKeyInMuSig2SessionResponse'],
  },
  {
    args: makeArgs({
      lnd: {
        signer: {
          muSig2CreateSession: (args, cbk) => {
            if (args.version === 'MUSIG2_VERSION_V100RC2') {
              return cbk({
                details: 'error parsing signer public key 0: bad pubkey byte string size (want 32, have 33)',
              });
            }

            return cbk({
              details: 'unknown method MuSig2CreateSession for service signrpc.Signer',
            });
          },
        },
        wallet: {
          deriveKey: ({}, cbk) => cbk(null, {
            key_loc: {key_index: 0},
            raw_key_bytes: Buffer.alloc(1),
          }),
        },
      },
    }),
    description: 'Just in case unsupported message is supported',
    error: [501, 'MuSig2BeginSigningSessionNotSupported'],
  },
  {
    args: makeArgs({
      lnd: {
        signer: {
          muSig2CreateSession: (args, cbk) => {
            if (args.version === 'MUSIG2_VERSION_V100RC2') {
              return cbk({
                details: 'error parsing signer public key 0: bad pubkey byte string size (want 32, have 33)',
              });
            }

            return cbk('err');
          },
        },
        wallet: {
          deriveKey: ({}, cbk) => cbk(null, {
            key_loc: {key_index: 0},
            raw_key_bytes: Buffer.alloc(1),
          }),
        },
      },
    }),
    description: 'Errors are passed back',
    error: [503, 'UnexpectedErrorCreatingMuSig2Session', {err: 'err'}],
  },
  {
    args: makeArgs({
      lnd: {
        signer: {
          muSig2CreateSession: (args, cbk) => {
            if (args.version === 'MUSIG2_VERSION_V100RC2') {
              return cbk({
                details: 'error parsing signer public key 0: bad pubkey byte string size (want 32, have 33)',
              });
            }

            return cbk(null, {});
          },
        },
        wallet: {
          deriveKey: ({}, cbk) => cbk(null, {
            key_loc: {key_index: 0},
            raw_key_bytes: Buffer.alloc(1),
          }),
        },
      },
    }),
    description: 'A valid response is expected',
    error: [503, 'ExpectedCombinedPublicKeyInMuSig2SessionResponse'],
  },
  {
    args: makeArgs({
      lnd: {
        signer: {
          muSig2CreateSession: (args, cbk) => {
            if (args.version === 'MUSIG2_VERSION_V100RC2') {
              return cbk({
                details: 'error parsing signer public key 0: bad pubkey byte string size (want 32, have 33)',
              });
            }

            return cbk(null, {
              combined_key: Buffer.alloc(32, 1),
              local_public_nonces: Buffer.alloc(66, 1),
              session_id: Buffer.alloc(32, 1),
              taproot_internal_key: Buffer.alloc(0),
            });
          },
        },
        wallet: {
          deriveKey: ({}, cbk) => cbk(null, {
            key_loc: {key_index: 0},
            raw_key_bytes: Buffer.alloc(1),
          }),
        },
      },
    }),
    description: 'Legacy signer is supported',
    expected: {
      external_key: '0101010101010101010101010101010101010101010101010101010101010101',
      id: '0101010101010101010101010101010101010101010101010101010101010101',
      internal_key: undefined,
      nonce: '010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101',
    },
  },
  {
    args: makeArgs({
      lnd: {
        signer: {
          muSig2CreateSession: (args, cbk) => {
            if (args.version === 'MUSIG2_VERSION_V100RC2') {
              return cbk({
                details: 'error parsing all signer public keys: error parsing signer public key 0 for v1.0.0rc2 (compressed format): malformed public key: invalid length: 32',
              });
            }

            return cbk(null, {
              combined_key: Buffer.alloc(32, 1),
              local_public_nonces: Buffer.alloc(66, 1),
              session_id: Buffer.alloc(32, 1),
              taproot_internal_key: Buffer.alloc(0),
            });
          },
        },
        wallet: {
          deriveKey: ({}, cbk) => cbk(null, {
            key_loc: {key_index: 0},
            raw_key_bytes: Buffer.alloc(1),
          }),
        },
      },
    }),
    description: 'Legacy signer is supported when invalid keys specified',
    expected: {
      external_key: '0101010101010101010101010101010101010101010101010101010101010101',
      id: '0101010101010101010101010101010101010101010101010101010101010101',
      internal_key: undefined,
      nonce: '010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101',
    },
  },
  {
    args: makeArgs({}),
    description: 'A group signing session is started',
    expected: {
      external_key: '0000000000000000000000000000000000000000000000000000000000000000',
      id: '0000000000000000000000000000000000000000000000000000000000000000',
      internal_key: undefined,
      nonce: '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    },
  },
  {
    args: makeArgs({
      public_keys: [Buffer.alloc(32, 1).toString('hex')],
      root_hash: Buffer.alloc(32).toString('hex'),
    }),
    description: 'A group signing session is started with a root hash',
    expected: {
      external_key: '0000000000000000000000000000000000000000000000000000000000000000',
      id: '0000000000000000000000000000000000000000000000000000000000000000',
      internal_key: undefined,
      nonce: '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    },
  },
  {
    args: makeArgs({is_key_spend: true}),
    description: 'A group signing session is started with a key spend',
    expected: {
      external_key: '0000000000000000000000000000000000000000000000000000000000000000',
      id: '0000000000000000000000000000000000000000000000000000000000000000',
      internal_key: undefined,
      nonce: '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async () => {
    if (!!error) {
      await rejects(beginGroupSigningSession(args), error, 'Got expected err');
    } else {
      const res = await beginGroupSigningSession(args);

      deepStrictEqual(res, expected, 'Got expected result');
    }

    return;
  });
});
