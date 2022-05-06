const {test} = require('@alexbosworth/tap');

const {rpcGroupSessionAsSession} = require('./../../lnd_responses');

const makeArgs = overrides => {
  const args = {
    combined_key: Buffer.alloc(32),
    local_public_nonces: Buffer.alloc(66),
    session_id: Buffer.alloc(32),
    taproot_internal_key: Buffer.alloc(32),
  };

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};


const tests = [
  {
    args: null,
    description: 'A response is expected',
    error: 'ExpectedResponseForMuSig2SessionRequest',
  },
  {
    args: makeArgs({combined_key: undefined}),
    description: 'A combined key is expected',
    error: 'ExpectedCombinedPublicKeyInMuSig2SessionResponse',
  },
  {
    args: makeArgs({local_public_nonces: undefined}),
    description: 'Local public nonces are expected',
    error: 'ExpectedLocalPublicNoncesInMuSig2SessionResponse',
  },
  {
    args: makeArgs({session_id: undefined}),
    description: 'A session id is expected',
    error: 'ExpectedMuSig2SigningSessionIdInSessionResponse',
  },
  {
    args: makeArgs({taproot_internal_key: undefined}),
    description: 'A taproot internal key is expected',
    error: 'ExpectedTaprootInternalKeyInMuSig2SessionResponse',
  },
  {
    args: makeArgs({}),
    description: 'Session data is returned',
    expected: {
      external_key: '0000000000000000000000000000000000000000000000000000000000000000',
      id: '0000000000000000000000000000000000000000000000000000000000000000',
      internal_key: '0000000000000000000000000000000000000000000000000000000000000000',
      nonce: '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    },
  },
  {
    args: makeArgs({taproot_internal_key: Buffer.alloc(0)}),
    description: 'Session data is returned for a script key',
    expected: {
      external_key: '0000000000000000000000000000000000000000000000000000000000000000',
      id: '0000000000000000000000000000000000000000000000000000000000000000',
      internal_key: undefined,
      nonce: '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, ({end, strictSame, throws}) => {
    if (!!error) {
      throws(() => rpcGroupSessionAsSession(args), new Error(error), 'Error');
    } else {
      const res = rpcGroupSessionAsSession(args);

      strictSame(res, expected, 'Got expected result');
    }

    return end();
  });
});
