const {test} = require('@alexbosworth/tap');

const {rpcConfAsConfirmation} = require('./../../lnd_responses');

const makeArgs = overrides => {
  const conf = {
    block_hash: Buffer.alloc(32),
    block_height: 1,
    raw_tx: Buffer.alloc(10),
  };

  Object.keys(overrides).forEach(k => conf[k] = overrides[k]);

  return {conf};
};


const tests = [
  {
    args: null,
    description: 'Event data is expected',
    error: 'ExpectedDataForConfEvent',
  },
  {
    args: makeArgs({block_hash: undefined}),
    description: 'A block hash is expected',
    error: 'ExpectedConfirmationBlockHash',
  },
  {
    args: makeArgs({block_height: undefined}),
    description: 'A block height is expected',
    error: 'ExpectedConfirmationHeight',
  },
  {
    args: makeArgs({raw_tx: undefined}),
    description: 'A raw transaction is expected',
    error: 'ExpectedRawTxInAddressConf',
  },
  {
    args: {reorg: {}},
    description: 'Reorg data is returned',
    expected: {type: 'reorg'},
  },
  {
    args: {},
    description: 'No event data is returned',
    expected: {},
  },
  {
    args: makeArgs({}),
    description: 'Confirmation data is returned',
    expected: {
      type: 'confirmation',
      data: {
        block: '0000000000000000000000000000000000000000000000000000000000000000',
        height: 1,
        transaction: '00000000000000000000',
      }
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, ({end, strictSame, throws}) => {
    if (!!error) {
      throws(() => rpcConfAsConfirmation(args), new Error(error), 'Got error');
    } else {
      const channel = rpcConfAsConfirmation(args);

      strictSame(channel, expected, 'Channel cast as channel');
    }

    return end();
  });
});
