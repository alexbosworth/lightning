const {test} = require('@alexbosworth/tap');

const {partiallySignPsbt} = require('./../../../lnd_methods');

const unsupported = {details: 'unknown method for service walletrpc.WalletKit'};

const makeLnd = overrides => {
  const res = {signed_psbt: Buffer.alloc(2)};

  Object.keys(overrides).forEach(k => res[k] = overrides[k]);

  return {wallet: {signPsbt: (args, cbk) => cbk(null, res)}};
};

const makeArgs = overrides => {
  const args = {lnd: makeLnd({}), psbt: '00'};

  Object.keys(overrides).forEach(key => args[key] = overrides[key]);

  return args;
};

const makeExpected = overrides => {
  const expected = {psbt: '0000'};

  Object.keys(overrides).forEach(k => expected[k] = overrides[k]);

  return expected;
};

const tests = [
  {
    args: makeArgs({lnd: undefined}),
    description: 'An LND object is required',
    error: [400, 'ExpectedAuthenticatedLndToPartiallySignPsbt'],
  },
  {
    args: makeArgs({psbt: undefined}),
    description: 'A PSBT is required',
    error: [400, 'ExpectedPsbtToPartiallySign'],
  },
  {
    args: makeArgs({
      lnd: {
        wallet: {
          signPsbt: ({}, cbk) => cbk({
            details: 'unknown method for service walletrpc.WalletKit',
          }),
        },
      },
    }),
    description: 'Unsupported error is passed back',
    error: [501, 'SignPsbtMethodNotSupported'],
  },
  {
    args: makeArgs({lnd: {wallet: {signPsbt: ({}, cbk) => cbk('err')}}}),
    description: 'Errors signing are passed back',
    error: [503, 'UnexpectedErrorPartiallySigningPsbt', {err: 'err'}],
  },
  {
    args: makeArgs({lnd: {wallet: {signPsbt: ({}, cbk) => cbk()}}}),
    description: 'A result is expected',
    error: [503, 'ExpectedResponseWhenPartiallySigningPsbt'],
  },
  {
    args: makeArgs({lnd: makeLnd({signed_psbt: undefined})}),
    description: 'A partially signed psbt is expected',
    error: [503, 'ExpectedSignPsbtInSignPsbtResult'],
  },
  {
    args: makeArgs({
      lnd: {
        wallet: {
          signPsbt: ({}, cbk) => cbk(null, {signed_psbt: Buffer.alloc(1)}),
        },
      },
    }),
    description: 'A signature is expected',
    error: [503, 'FailedToModifyInputPsbt'],
  },
  {
    args: makeArgs({}),
    description: 'PSBT partial signing is executed',
    expected: makeExpected({}),
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, rejects, strictSame}) => {
    if (!!error) {
      await rejects(partiallySignPsbt(args), error, 'Got error');
    } else {
      const got = await partiallySignPsbt(args);

      strictSame(got, expected, 'Got expected result');
    }

    return end();
  });
});
