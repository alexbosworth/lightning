const {deepEqual} = require('node:assert').strict;
const {rejects} = require('node:assert').strict;
const test = require('node:test');

const {deleteChainTransaction} = require('./../../../lnd_methods');

const makeLnd = () => {
  return {
    wallet: {
      removeTransaction: ({}, cbk) => {
        return cbk(null, {status: 'Successfully removed transaction'});
      },
    },
  };
};

const tests = [
  {
    args: {},
    description: 'An id is required to delete a chain transaction',
    error: [400, 'ExpectedIdentifyingTxHashOfChainTxToDelete'],
  },
  {
    args: {id: Buffer.alloc(32).toString('hex')},
    description: 'LND Object is required to delete a chain transaction',
    error: [400, 'ExpectedLndToDeleteChainTransaction'],
  },
  {
    args: {
      id: Buffer.alloc(32).toString('hex'),
      lnd: {wallet: {removeTransaction: ({}, cbk) => cbk('err')}},
    },
    description: 'Errors are passed back from remove transaction method',
    error: [503, 'UnexpectedDeleteChainTransactionError', {err: 'err'}],
  },
  {
    args: {
      id: Buffer.alloc(32).toString('hex'),
      lnd: {
        wallet: {
          removeTransaction: ({}, cbk) => cbk({
            details: 'unknown walletrpc.WalletKit',
          }),
        },
      },
    },
    description: 'Unsupported errors are returned',
    error: [501, 'RemoveChainTransactionMethodNotSupported'],
  },
  {
    args: {
      id: Buffer.alloc(32).toString('hex'),
      lnd: {wallet: {removeTransaction: ({}, cbk) => cbk()}},
    },
    description: 'A response is expected from remove transaction',
    error: [503, 'ExpectedResponseDeletingChainTransaction'],
  },
  {
    args: {
      id: Buffer.alloc(32).toString('hex'),
      lnd: {wallet: {removeTransaction: ({}, cbk) => cbk(null, {})}},
    },
    description: 'A success response is expected from remove transaction',
    error: [503, 'UnexpectedResponseDeletingChainTransaction'],
  },
  {
    args: {
      id: Buffer.alloc(32).toString('hex'),
      lnd: makeLnd({}),
    },
    description: 'Remove transaction returns successfully',
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async () => {
    if (!!error) {
      await rejects(() => deleteChainTransaction(args), error, 'Got err');
    } else {
      await deleteChainTransaction(args);
    }

    return;
  });
});
