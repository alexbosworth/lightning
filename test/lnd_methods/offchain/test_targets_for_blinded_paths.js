const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

const method = require('./../../../lnd_methods/offchain/targets_for_blinded_paths');

const blindedKey = `03${'02'.repeat(32)}`;
const introductionNode = `02${'01'.repeat(32)}`;

const makePath = overrides => {
  const path = {
    base_fee_mtokens: '10',
    cltv_delta: 40,
    fee_rate: 1000,
    hops: [
      {encrypted_data: '01', relay_key: introductionNode},
      {encrypted_data: '02', relay_key: blindedKey},
    ],
    introduction_node: introductionNode,
    key: `02${'03'.repeat(32)}`,
    max_htlc_mtokens: '100000',
    min_htlc_mtokens: '1',
  };

  Object.keys(overrides || {}).forEach(k => path[k] = overrides[k]);

  return path;
};

const tests = [
  {
    args: {max_fee_mtokens: 1, mtokens: '1000', paths: [makePath({})]},
    description: 'A max fee millitokens string is expected when specified',
    error: 'ExpectedMaxFeeMillitokensToDeriveTargetsForBlindedPaths',
  },
  {
    args: {paths: [makePath({})]},
    description: 'Millitokens to deliver are expected',
    error: 'ExpectedMillitokensToDeriveTargetsForBlindedPaths',
  },
  {
    args: {mtokens: '1000', paths: []},
    description: 'Blinded paths are expected',
    error: 'ExpectedArrayOfBlindedPathsToDeriveTargets',
  },
  {
    args: {mtokens: '1000', paths: [makePath({min_htlc_mtokens: '2000'})]},
    description: 'A path must allow the amount by its minimum',
    error: 'ExpectedBlindedPathAllowingAmountToProbe',
  },
  {
    args: {mtokens: '1000', paths: [makePath({max_htlc_mtokens: '999'})]},
    description: 'A path must allow the amount by its maximum',
    error: 'ExpectedBlindedPathAllowingAmountToProbe',
  },
  {
    args: {mtokens: '1000', paths: [makePath({})]},
    description: 'A target is derived for a path',
    expected: {
      targets: [{
        cltv_delta: 40,
        destination: introductionNode,
        max_fee_mtokens: undefined,
        mtokens: '1011',
        path: makePath({}),
      }],
    },
  },
  {
    args: {
      max_fee_mtokens: '15',
      mtokens: '1000',
      paths: [makePath({}), makePath({base_fee_mtokens: '20'})],
    },
    description: 'Paths with fees beyond the max fee are not targets',
    expected: {
      targets: [{
        cltv_delta: 40,
        destination: introductionNode,
        max_fee_mtokens: '4',
        mtokens: '1011',
        path: makePath({}),
      }],
    },
  },
  {
    args: {
      mtokens: '1000',
      paths: [makePath({introduction_node: undefined, max_htlc_mtokens: '0'})],
    },
    description: 'The introduction node is the first hop, zero max is no max',
    expected: {
      targets: [{
        cltv_delta: 40,
        destination: introductionNode,
        max_fee_mtokens: undefined,
        mtokens: '1011',
        path: makePath({introduction_node: undefined, max_htlc_mtokens: '0'}),
      }],
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, (t, end) => {
    if (!!error) {
      throws(() => method(args), new Error(error), 'Got expected error');
    } else {
      deepStrictEqual(method(args), expected, 'Got expected targets');
    }

    return end();
  });
});
