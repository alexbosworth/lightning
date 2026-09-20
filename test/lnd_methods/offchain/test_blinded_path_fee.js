const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

const method = require('./../../../lnd_methods/offchain/blinded_path_fee');

const hop = {encrypted_data: '00', relay_key: Buffer.alloc(33).toString('hex')};

const tests = [
  {
    args: {},
    description: 'Millitokens are required',
    error: 'ExpectedMillitokensToCalculateBlindedPathFee',
  },
  {
    args: {mtokens: '1000'},
    description: 'A path is required',
    error: 'ExpectedBlindedPathToCalculateBlindedPathFee',
  },
  {
    args: {mtokens: '1000', path: {}},
    description: 'A path base fee is required',
    error: 'ExpectedBaseFeeMillitokensToCalculateBlindedPathFee',
  },
  {
    args: {mtokens: '1000', path: {base_fee_mtokens: '1'}},
    description: 'A path fee rate is required',
    error: 'ExpectedFeeRateToCalculateBlindedPathFee',
  },
  {
    args: {mtokens: '1000', path: {base_fee_mtokens: '1', fee_rate: 1}},
    description: 'Path hops are required',
    error: 'ExpectedPathHopsToCalculateBlindedPathFee',
  },
  {
    args: {
      mtokens: '1000',
      path: {base_fee_mtokens: '1', fee_rate: 1000, hops: [hop]},
    },
    description: 'An introduction node only path has no fee',
    expected: {fee_mtokens: '0'},
  },
  {
    args: {
      mtokens: '1999',
      path: {base_fee_mtokens: '10', fee_rate: 1000, hops: [hop, hop]},
    },
    description: 'A path fee is calculated with the proportional fee floored',
    expected: {fee_mtokens: '11'},
  },
  {
    args: {
      mtokens: '1000000000',
      path: {base_fee_mtokens: '0', fee_rate: 2500, hops: [hop, hop, hop]},
    },
    description: 'A path fee is calculated for a large amount',
    expected: {fee_mtokens: '2500000'},
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, (t, end) => {
    if (!!error) {
      throws(() => method(args), new Error(error), 'Got expected error');
    } else {
      deepStrictEqual(method(args), expected, 'Got expected fee');
    }

    return end();
  });
});
