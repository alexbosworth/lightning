const {test} = require('@alexbosworth/tap');

const {signPsbt} = require('./../../../lnd_methods');

const unsupported = {details: 'unknown method for service walletrpc.WalletKit'};

const makeLnd = overrides => {
  const res = {raw_final_tx: Buffer.alloc(1), signed_psbt: Buffer.alloc(2)};

  Object.keys(overrides).forEach(k => res[k] = overrides[k]);

  return {wallet: {finalizePsbt: (args, cbk) => cbk(null, res)}};
};

const makeArgs = overrides => {
  const args = {lnd: makeLnd({}), psbt: 'psbt'};

  Object.keys(overrides).forEach(key => args[key] = overrides[key]);

  return args;
};

const makeExpected = overrides => {
  const expected = {psbt: '0000', transaction: '00'};

  Object.keys(overrides).forEach(k => expected[k] = overrides[k]);

  return expected;
};

const tests = [
  {
    args: makeArgs({lnd: undefined}),
    description: 'An LND object is required',
    error: [400, 'ExpectedAuthenticatedLndToSignPsbt'],
  },
  {
    args: makeArgs({psbt: undefined}),
    description: 'A PSBT is required',
    error: [400, 'ExpectedPsbtToSignAndFinalize'],
  },
  {
    args: makeArgs({
      lnd: {
        wallet: {
          finalizePsbt: ({}, cbk) => cbk({
            details: 'unknown method for service walletrpc.WalletKit',
          }),
        },
      },
    }),
    description: 'Unsupported error is passed back',
    error: [501, 'SignPsbtMethodNotSupported'],
  },
  {
    args: makeArgs({lnd: {wallet: {finalizePsbt: ({}, cbk) => cbk('err')}}}),
    description: 'Errors signing are passed back',
    error: [503, 'UnexpectedErrorSigningPsbt', {err: 'err'}],
  },
  {
    args: makeArgs({lnd: {wallet: {finalizePsbt: ({}, cbk) => cbk()}}}),
    description: 'A result is expected',
    error: [503, 'ExpectedResponseWhenSigningPsbt'],
  },
  {
    args: makeArgs({lnd: makeLnd({raw_final_tx: undefined})}),
    description: 'A raw final tx is expected',
    error: [503, 'ExpectedRawFinalTransactionInPsbtResult'],
  },
  {
    args: makeArgs({lnd: makeLnd({signed_psbt: undefined})}),
    description: 'A signed and finalized psbt is expected',
    error: [503, 'ExpectedSignPsbtInSignPsbtResult'],
  },
  {
    args: makeArgs({}),
    description: 'PSBT signing is executed',
    expected: makeExpected({}),
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, rejects, strictSame}) => {
    if (!!error) {
      await rejects(signPsbt(args), error, 'Got error');
    } else {
      const got = await signPsbt(args);

      strictSame(got, expected, 'Got expected result');
    }

    return end();
  });
});
