const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

const {rpcSpendAsConfirmation} = require('./../../lnd_responses');

const makeArgs = overrides => {
  const spend = {
    raw_spending_tx: Buffer.alloc(10),
    spending_height: 200,
    spending_input_index: 1,
  };

  Object.keys(overrides).forEach(k => spend[k] = overrides[k]);

  return {spend};
};

const tests = [
  {
    args: undefined,
    description: 'Event data is expected',
    error: 'ExpectedSpendConfEvent',
  },
  {
    args: {},
    description: 'A spend or a reorg is expected',
    error: 'ExpectedSpendTxReorgEvent',
  },
  {
    args: makeArgs({raw_spending_tx: undefined}),
    description: 'A raw spending transaction is expected',
    error: 'ExpectedRawTxInSpendConf',
  },
  {
    args: makeArgs({spending_height: undefined}),
    description: 'A spending height is expected',
    error: 'ExpectedHeightInSpendConf',
  },
  {
    args: makeArgs({spending_input_index: undefined}),
    description: 'A spending input index is expected',
    error: 'ExpectedVinInSpendConf',
  },
  {
    args: {reorg: {}},
    description: 'A reorg is mapped to a reorg event',
    expected: {type: 'reorg'},
  },
  {
    args: makeArgs({}),
    description: 'A spend is mapped to a confirmation event',
    expected: {
      type: 'confirmation',
      data: {
        height: 200,
        transaction: Buffer.alloc(10).toString('hex'),
        vin: 1,
      },
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, (t, end) => {
    if (!!error) {
      throws(() => rpcSpendAsConfirmation(args), new Error(error), 'Got err');
    } else {
      deepStrictEqual(rpcSpendAsConfirmation(args), expected, 'Got event');
    }

    return end();
  });
});
