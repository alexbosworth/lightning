const {test} = require('@alexbosworth/tap');

const {updateGroupSigningSession} = require('./../../../');

const makeLnd = ({noncesErr, noncesRes, signErr, signRes}) => {
  return {
    signer: {
      muSig2RegisterNonces: ({}, cbk) => cbk(noncesErr, noncesRes),
      muSig2Sign: ({}, cbk) => cbk(signErr, signRes),
    },
  };
};

const makeArgs = override => {
  const args = {
    hash: Buffer.alloc(32).toString('hex'),
    id: Buffer.alloc(32).toString('hex'),
    lnd: makeLnd({
      noncesRes: {have_all_nonces: true},
      signRes: {local_partial_signature: Buffer.alloc(64)},
    }),
    nonces: [Buffer.alloc(66).toString('hex')],
  };

  Object.keys(override || {}).forEach(key => args[key] = override[key]);

  return args;
};

const tests = [
  {
    args: makeArgs({hash: undefined}),
    description: 'A hash to sign is required',
    error: [400, 'ExpectedHashToSignToUpdateMuSig2Session'],
  },
  {
    args: makeArgs({id: undefined}),
    description: 'A signing group id is required',
    error: [400, 'ExpectedSessionIdToUpdateMuSig2Session'],
  },
  {
    args: makeArgs({lnd: undefined}),
    description: 'LND object is required',
    error: [400, 'ExpectedAuthenticatedLndToUpdateMuSig2Session'],
  },
  {
    args: makeArgs({nonces: undefined}),
    description: 'Nonces are required',
    error: [400, 'ExpectedArrayOfNoncesToUpdateMuSig2Session'],
  },
  {
    args: makeArgs({lnd: makeLnd({noncesErr: 'err'})}),
    description: 'Update nonces errors are passed back',
    error: [503, 'UnexpectedErrorUpdatingMuSig2Session', {err: 'err'}],
  },
  {
    args: makeArgs({lnd: makeLnd({noncesRes: null})}),
    description: 'An update response is expected',
    error: [503, 'ExpectedResultOfRegisterNoncesRequest'],
  },
  {
    args: makeArgs({lnd: makeLnd({noncesRes: {}})}),
    description: 'A successful update response is expected',
    error: [400, 'ExpectedAllNoncesForRegisterNoncesRequest'],
  },
  {
    args: makeArgs({
      lnd: makeLnd({noncesRes: {have_all_nonces: true}, signErr: 'err'}),
    }),
    description: 'Sign errors are passed back',
    error: [503, 'UnexpectedErrorSigningMuSig2Session', {err: 'err'}],
  },
  {
    args: makeArgs({
      lnd: makeLnd({noncesRes: {have_all_nonces: true}, signRes: null}),
    }),
    description: 'Sign response is expected',
    error: [503, 'ExpectedResultForMuSig2SignRequest'],
  },
  {
    args: makeArgs({
      lnd: makeLnd({noncesRes: {have_all_nonces: true}, signRes: {}}),
    }),
    description: 'A partial signature is expected',
    error: [503, 'ExpectedPartialSignatureForMuSig2SignRequest'],
  },
  {
    args: makeArgs({}),
    description: 'A group signing session is updated',
    expected: {
      signature: '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, rejects, strictSame}) => {
    if (!!error) {
      await rejects(updateGroupSigningSession(args), error, 'Got expected err');
    } else {
      const res = await updateGroupSigningSession(args);

      strictSame(res, expected, 'Got expected result');
    }

    return end();
  });
});
