const {test} = require('@alexbosworth/tap');
const {Transaction} = require('bitcoinjs-lib');

const {deletePendingChannel} = require('./../../../lnd_methods');

const tx1 = new Transaction();
const tx2 = new Transaction();
const tx3 = new Transaction();

tx1.addInput(Buffer.alloc(32, 0), 0);
tx2.addInput(Buffer.alloc(32, 0), 0);
tx2.addInput(Buffer.alloc(32, 1), 0);
tx2.addOutput(Buffer.alloc(10), 1);
tx3.addInput(Buffer.alloc(32, 2), 0);

const makeArgs = overrides => {
  const args = {
    confirmed_transaction: tx1.toHex(),
    lnd: {default: {abandonChannel: ({}, cbk) => cbk()}},
    pending_transaction: tx2.toHex(),
    pending_transaction_vout: 0,
  };

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const tests = [
  {
    args: makeArgs({confirmed_transaction: undefined}),
    description: 'A conflicting confirmed tx is required',
    error: [400, 'ExpectedConfirmedConflictingTxToDeleteChannel'],
  },
  {
    args: makeArgs({confirmed_transaction: 'confirmed transaction'}),
    description: 'A valid conflicting confirmed tx is required',
    error: [400, 'ExpectedValidConfirmedTxToDeleteChannel'],
  },
  {
    args: makeArgs({confirmed_transaction: tx2.toHex()}),
    description: 'Pending transaction must be different from confirmed tx',
    error: [400, 'ExpectedConflictingTransactionToDeleteChannel'],
  },
  {
    args: makeArgs({lnd: undefined}),
    description: 'Lnd is required',
    error: [400, 'ExpectedAuthenticatedLndToDeleteChannel'],
  },
  {
    args: makeArgs({pending_transaction: undefined}),
    description: 'A pending tx is required',
    error: [400, 'ExpectedPendingTransactionToDeleteChannel'],
  },
  {
    args: makeArgs({pending_transaction: 'pending transaction'}),
    description: 'A valid pending tx is required',
    error: [400, 'ExpectedValidPendingTxToDeleteChannel'],
  },
  {
    args: makeArgs({pending_transaction_vout: undefined}),
    description: 'A pending tx output index is required',
    error: [400, 'ExpectedPendingChannelTxVoutToDeleteChannel'],
  },
  {
    args: makeArgs({confirmed_transaction: tx3.toHex()}),
    description: 'A conflicting tx is required',
    error: [400, 'FailedToFindConflictingInputInConfirmedTx'],
  },
  {
    args: makeArgs({lnd: {default: {abandonChannel: ({}, cbk) => cbk({
      details: 'AbandonChannel RPC call only available in dev builds',
    })}}}),
    description: 'Method unsupported error is returned',
    error: [501, 'DeletePendingChannelMethodNotSupported'],
  },
  {
    args: makeArgs({lnd: {default: {abandonChannel: ({}, cbk) => cbk('er')}}}),
    description: 'A server error is passed back',
    error: [503, 'UnexpectedErrorDeletingPendingChannel', {err: 'er'}],
  },
  {
    args: makeArgs({}),
    description: 'A pending channel is deleted',
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({deepEqual, end, equal, rejects}) => {
    if (!!error) {
      await rejects(() => deletePendingChannel(args), error, 'Got error');
    } else {
      await deletePendingChannel(args);
    }

    return end();
  });
});
