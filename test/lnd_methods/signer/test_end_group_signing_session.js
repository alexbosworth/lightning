const {test} = require('@alexbosworth/tap');

const {endGroupSigningSession} = require('./../../../');

const makeLnd = ({cleanErr, combineErr, combineRes}) => {
  return {
    signer: {
      muSig2Cleanup: ({}, cbk) => cbk(cleanErr),
      muSig2CombineSig: ({}, cbk) => cbk(combineErr, combineRes),
    },
  };
};

const makeArgs = override => {
  const args = {
    id: Buffer.alloc(32).toString('hex'),
    lnd: makeLnd({combineRes: {final_signature: Buffer.alloc(64)}}),
    signatures: [Buffer.alloc(64).toString('hex')],
  };

  Object.keys(override || {}).forEach(key => args[key] = override[key]);

  return args;
};

const tests = [
  {
    args: makeArgs({id: undefined}),
    description: 'A session id is required',
    error: [400, 'ExpectedSessionIdToFinishMuSig2Session'],
  },
  {
    args: makeArgs({lnd: undefined}),
    description: 'An authenticated lnd is required',
    error: [400, 'ExpectedAuthenticatedLndToFinishMuSig2Session'],
  },
  {
    args: makeArgs({signatures: []}),
    description: 'Signatures are required',
    error: [400, 'ExpectedPartialSignaturesToCombineToEndSession'],
  },
  {
    args: makeArgs({lnd: makeLnd({cleanErr: 'err'}), signatures: undefined}),
    description: 'A cleanup error is passed back',
    error: [503, 'UnexpectedErrorCleaningUpMuSig2Session', {err: 'err'}],
  },
  {
    args: makeArgs({lnd: makeLnd({combineErr: 'err'})}),
    description: 'A combine error is passed back',
    error: [503, 'UnexpectedErrorFinishingMuSig2Session', {err: 'err'}],
  },
  {
    args: makeArgs({lnd: makeLnd({combineRes: null})}),
    description: 'A combine response is expected',
    error: [503, 'ExpectedResponseForMuSig2CombineRequest'],
  },
  {
    args: makeArgs({lnd: makeLnd({combineRes: {have_all_signatures: false}})}),
    description: 'A combine success response is expected',
    error: [400, 'ExpectedAllSignaturesProvidedForSession'],
  },
  {
    args: makeArgs({lnd: makeLnd({combineRes: {}})}),
    description: 'A combined signature is expected',
    error: [503, 'ExpectedFinalSignatureInCombineResponse'],
  },
  {
    args: makeArgs({}),
    description: 'A group signing session is ended',
    expected: {
      signature: '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    },
  },
  {
    args: makeArgs({signatures: undefined}),
    description: 'A group signing session is canceled',
    expected: {},
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, rejects, strictSame}) => {
    if (!!error) {
      await rejects(endGroupSigningSession(args), error, 'Got expected err');
    } else {
      const res = await endGroupSigningSession(args);

      strictSame(res, expected, 'Got expected result');
    }

    return end();
  });
});
