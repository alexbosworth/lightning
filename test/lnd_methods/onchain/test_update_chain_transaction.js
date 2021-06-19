const {test} = require('@alexbosworth/tap');

const {updateChainTransaction} = require('./../../../lnd_methods');

const makeLnd = ({err}) => {
  return {
    wallet: {
      labelTransaction: (args, cbk) => {
        return cbk(err);
      },
    },
  };
};

const makeArgs = overrides => {
  const args = {
    description: 'description',
    id: Buffer.alloc(32).toString('hex'),
    lnd: makeLnd({}),
  };

  Object.keys(overrides).forEach(key => args[key] = overrides[key]);

  return args;
};

const tests = [
  {
    args: makeArgs({description: undefined}),
    description: 'A description is expected when updating chain transactions',
    error: [400, 'ExpectedDescriptionForChainTransaction'],
  },
  {
    args: makeArgs({id: undefined}),
    description: 'A transaction id is expected to update a chain transaction',
    error: [400, 'ExpectedTransactionIdToUpdateChainTransaction'],
  },
  {
    args: makeArgs({lnd: undefined}),
    description: 'LND API Object is expected when updating chain transactions',
    error: [400, 'ExpectedLndToUpdateChainTransaction'],
  },
  {
    args: makeArgs({
      lnd: makeLnd({err: {details: 'unknown service walletrpc.WalletKit'}}),
    }),
    description: 'Unsupported service returns unsupported error',
    error: [501, 'BackingLndDoesNotSupportUpdatingTransactions'],
  },
  {
    args: makeArgs({
      lnd: makeLnd({
        err: {details: 'cannot label transaction not known to wallet'},
      }),
    }),
    description: 'Unknown transaction returns error',
    error: [404, 'FailedToFindTransactionToUpdate'],
  },
  {
    args: makeArgs({lnd: makeLnd({err: 'err'})}),
    description: 'An unexpected error is returned',
    error: [503, 'UnexpectedErrUpdatingChainTransaction', {err: 'err'}],
  },
  {
    args: makeArgs({}),
    description: 'Normally a transaction is updated successfully',
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({deepEqual, end, equal, rejects}) => {
    if (!!error) {
      await rejects(() => updateChainTransaction(args), error, 'Got error');
    } else {
      await updateChainTransaction(args);
    }

    return end();
  });
});
