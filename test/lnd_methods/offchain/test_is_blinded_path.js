const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');

const isBlindedPath = require('./../../../lnd_methods/offchain/is_blinded_path');

const key = `02${'01'.repeat(32)}`;

const makePath = overrides => {
  const path = {
    base_fee_mtokens: '1',
    cltv_delta: 40,
    fee_rate: 1,
    hops: [{encrypted_data: '00', relay_key: key}],
    introduction_node: key,
    key,
    max_htlc_mtokens: '10',
    min_htlc_mtokens: '1',
  };

  Object.keys(overrides || {}).forEach(k => path[k] = overrides[k]);

  return path;
};

const tests = [
  {
    args: undefined,
    description: 'A path is expected',
    expected: false,
  },
  {
    args: makePath({base_fee_mtokens: 1}),
    description: 'A base fee millitokens string is expected',
    expected: false,
  },
  {
    args: makePath({cltv_delta: '40'}),
    description: 'A cltv delta number is expected',
    expected: false,
  },
  {
    args: makePath({fee_rate: '1'}),
    description: 'A fee rate number is expected',
    expected: false,
  },
  {
    args: makePath({hops: []}),
    description: 'Hops are expected',
    expected: false,
  },
  {
    args: makePath({hops: [{relay_key: key}]}),
    description: 'Hop encrypted data is expected',
    expected: false,
  },
  {
    args: makePath({hops: [{encrypted_data: '00', relay_key: 'key'}]}),
    description: 'Hop relay keys are expected',
    expected: false,
  },
  {
    args: makePath({key: undefined}),
    description: 'A path key is expected',
    expected: false,
  },
  {
    args: makePath({introduction_node: 'node'}),
    description: 'A valid introduction node is expected when specified',
    expected: false,
  },
  {
    args: makePath({max_htlc_mtokens: 10}),
    description: 'A max htlc millitokens string is expected when specified',
    expected: false,
  },
  {
    args: makePath({min_htlc_mtokens: 1}),
    description: 'A min htlc millitokens string is expected when specified',
    expected: false,
  },
  {
    args: makePath({}),
    description: 'A blinded path is valid',
    expected: true,
  },
  {
    args: makePath({
      introduction_node: undefined,
      max_htlc_mtokens: undefined,
      min_htlc_mtokens: undefined,
    }),
    description: 'A blinded path without optional attributes is valid',
    expected: true,
  },
];

tests.forEach(({args, description, expected}) => {
  return test(description, (t, end) => {
    deepStrictEqual(isBlindedPath(args), expected, 'Got expected result');

    return end();
  });
});
