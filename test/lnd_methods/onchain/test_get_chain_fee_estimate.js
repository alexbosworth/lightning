const {deepStrictEqual} = require('node:assert').strict;
const {rejects} = require('node:assert').strict;
const test = require('node:test');

const {getChainFeeEstimate} = require('./../../../lnd_methods');

const tests = [
  {
    args: {},
    description: 'LND Object is required to get chain fee estimate',
    error: [400, 'ExpectedLndToEstimateChainFee'],
  },
  {
    args: {lnd: {default: {estimateFee: ({}, cbk) => cbk()}}},
    description: 'Send to addresses are required to estimate fee',
    error: [400, 'ExpectedSendToAddressesToEstimateChainFee'],
  },
  {
    args: {lnd: {default: {estimateFee: ({}, cbk) => cbk()}}, send_to: []},
    description: 'A send to address is required to estimate chain fee',
    error: [400, 'ExpectedSendToAddressesToEstimateChainFee'],
  },
  {
    args: {lnd: {default: {estimateFee: ({}, cbk) => cbk()}}, send_to: ['']},
    description: 'A valid send to address is required to estimate chain fee',
    error: [400, 'ExpectedSendToAddressInEstimateChainFee'],
  },
  {
    args: {
      lnd: {default: {estimateFee: ({}, cbk) => cbk('err')}},
      send_to: [{address: 'address'}],
    },
    description: 'Send to tokens are required to estimate chain fee',
    error: [400, 'ExpectedSendToTokensInEstimateChainFee'],
  },
  {
    args: {
      lnd: {default: {estimateFee: ({}, cbk) => cbk('err')}},
      send_to: [{address: 'address', tokens: 1}],
    },
    description: 'An error is passed back from fee estimate',
    error: [503, 'UnexpectedErrEstimatingFeeForChainSend', {err: 'err'}],
  },
  {
    args: {
      lnd: {default: {estimateFee: ({}, cbk) => cbk()}},
      send_to: [{address: 'address', tokens: 1}],
    },
    description: 'A response is expected from fee estimate',
    error: [503, 'ExpectedResponseFromEstimateFeeApi'],
  },
  {
    args: {
      lnd: {default: {estimateFee: ({}, cbk) => cbk(null, {})}},
      send_to: [{address: 'address', tokens: 1}],
    },
    description: 'Fee sat is expected in estimate fee response',
    error: [503, 'ExpectedChainFeeInResponseToChainFeeEstimate'],
  },
  {
    args: {
      lnd: {
        default: {
          estimateFee: ({}, cbk) => cbk(null, {
            fee_sat: '1',
            sat_per_vbyte: '2',
          }),
        },
      },
      send_to: [{address: 'address', tokens: 1}],
      utxo_confirmations: 0,
    },
    description: 'Sat per vbyte result is supported',
    expected: {fee: 1, tokens_per_vbyte: 2},
  },
  {
    args: {
      lnd: {
        default: {
          estimateFee: ({}, cbk) => cbk(null, {
            fee_sat: '1',
            sat_per_vbyte: '2',
          }),
        },
      },
      send_to: [{address: 'address', tokens: 1}],
      utxo_confirmations: 0,
      utxo_selection: 'largest',
    },
    description: 'Coin selection can be specified',
    expected: {fee: 1, tokens_per_vbyte: 2},
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async () => {
    if (!!error) {
      await rejects(() => getChainFeeEstimate(args), error, 'Got error');
    } else {
      const estimate = await getChainFeeEstimate(args);

      deepStrictEqual(estimate, expected, 'Got chain fee estimate');
    }

    return;
  });
});
