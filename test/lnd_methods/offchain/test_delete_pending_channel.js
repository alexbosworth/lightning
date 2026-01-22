const {rejects} = require('node:assert').strict;
const test = require('node:test');

const {deletePendingChannel} = require('./../../../lnd_methods');

const tx1 = '010000000100000000000000000000000000000000000000000000000000000000000000000000000000ffffffff0000000000';
const tx2 = '010000000200000000000000000000000000000000000000000000000000000000000000000000000000ffffffff01010101010101010101010101010101010101010101010101010101010101010000000000ffffffff0101000000000000000a0000000000000000000000000000';
const tx3 = '010000000102020202020202020202020202020202020202020202020202020202020202020000000000ffffffff0000000000';

const makeArgs = overrides => {
  const args = {
    confirmed_transaction: tx1,
    lnd: {default: {abandonChannel: ({}, cbk) => cbk()}},
    pending_transaction: tx2,
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
    args: makeArgs({confirmed_transaction: tx2}),
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
    args: makeArgs({confirmed_transaction: tx3}),
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
  return test(description, async () => {
    if (!!error) {
      await rejects(() => deletePendingChannel(args), error, 'Got error');
    } else {
      await deletePendingChannel(args);
    }

    return;
  });
});
