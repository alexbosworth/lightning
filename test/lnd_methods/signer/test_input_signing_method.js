const {test} = require('@alexbosworth/tap');

const method = require('./../../../lnd_methods/signer/input_signing_method');

const makeArgs = override => {
  const args = {
    input: {
      root_hash: '00',
      witness_script: '00',
    },
    outputs: [{
      pk_script: Buffer.alloc(1),
      value: 1,
    }],
  };

  Object.keys(override || {}).forEach(key => args[key] = override[key]);

  return args;
};

const tests = [
  {
    args: makeArgs({}),
    description: 'Input signing method is returned for a leaf spend',
    expected: {method: 3},
  },
  {
    args: makeArgs({input: {}, outputs: undefined}),
    description: 'Input signing method is returned for a regular spend',
    expected: {method: 0},
  },
  {
    args: makeArgs({input: {}}),
    description: 'Input signing method is returned for a bip86 spend',
    expected: {method: 1},
  },
  {
    args: makeArgs({input: {root_hash: '00'}}),
    description: 'Input signing method is returned for a top key script spend',
    expected: {method: 2},
  },
];

tests.forEach(({args, description, expected}) => {
  return test(description, async ({end, strictSame}) => {
    const res = method(args);

    strictSame(res, expected, 'Got expected result');

    return end();
  });
});
