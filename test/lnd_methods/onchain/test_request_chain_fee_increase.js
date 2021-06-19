const {test} = require('@alexbosworth/tap');

const {requestChainFeeIncrease} = require('./../../../lnd_methods');

const makeLnd = overrides => {
  const res = {};

  Object.keys(overrides).forEach(k => res[k] = overrides[k]);

  return {wallet: {bumpFee: (args, cbk) => cbk(null, res)}};
};

const makeArgs = overrides => {
  const args = {
    lnd: makeLnd({}),
    transaction_id: Buffer.alloc(32).toString('hex'),
    transaction_vout: 0,
  };

  Object.keys(overrides).forEach(key => args[key] = overrides[key]);

  return args;
};

const tests = [
  {
    args: makeArgs({fee_tokens_per_vbyte: 1, target_confirmations: 1}),
    description: 'Passing both fee rate and confirmation target is not ok',
    error: [400, 'ExpectedEitherFeeRateOrTargetNotBothToBumpFee'],
  },
  {
    args: makeArgs({lnd: undefined}),
    description: 'An LND object is required',
    error: [400, 'ExpectedLndToRequestChainFeeIncrease'],
  },
  {
    args: makeArgs({transaction_id: undefined}),
    description: 'A transaction id is required',
    error: [400, 'ExpectedTransactionIdToRequestChainFeeIncrease'],
  },
  {
    args: makeArgs({transaction_vout: undefined}),
    description: 'A tx output index is required',
    error: [400, 'ExpectedTransactionOutputIndexToRequestFeeBump'],
  },
  {
    args: makeArgs({lnd: {wallet: {bumpFee: ({}, cbk) => cbk('err')}}}),
    description: 'Errors are passed back',
    error: [500, 'UnexpectedErrorRequestingChainFeeBump', {err: 'err'}],
  },
  {
    args: makeArgs({}),
    description: 'Fee bump is requested',
  },
  {
    args: makeArgs({fee_tokens_per_vbyte: 1}),
    description: 'Fee bump is requested with specific fee rate',
  },
  {
    args: makeArgs({target_confirmations: 1}),
    description: 'Fee bump is requested with specific fee rate',
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, rejects}) => {
    if (!!error) {
      await rejects(requestChainFeeIncrease(args), error, 'Got error');
    } else {
      await requestChainFeeIncrease(args);
    }

    return end();
  });
});
