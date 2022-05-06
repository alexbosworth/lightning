const {test} = require('@alexbosworth/tap');

const {beginGroupSigningSession} = require('./../../../');

const makeLnd = (err, res) => {
  return {
    signer: {
      muSig2CreateSession: ({}, cbk) => cbk(err, res)
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
  return test(description, async ({end, rejects, strictSame}) => {
    if (!!error) {
      await rejects(beginGroupSigningSession(args), error, 'Got expected err');
    } else {
      const res = await beginGroupSigningSession(args);

      strictSame(res, expected, 'Got expected result');
    }

    return end();
  });
});
