const {test} = require('@alexbosworth/tap');

const {unlockUtxo} = require('./../../../lnd_methods');

const id = Buffer.alloc(32).toString('hex');

const makeArgs = overrides => {
  const args = {
    id,
    lnd: {wallet: {releaseOutput: ({}, cbk) => cbk()}},
    transaction_id: id,
    transaction_vout: 0,
  };

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const tests = [
  {
    args: makeArgs({id: undefined}),
    description: 'A locking id is required to unlock a utxo',
    error: [400, 'ExpectedUtxoLockIdToUnlockUtxo'],
  },
  {
    args: makeArgs({lnd: undefined}),
    description: 'LND is required to unlock a utxo',
    error: [400, 'ExpectedLndToUnlockUtxo'],
  },
  {
    args: makeArgs({transaction_id: undefined}),
    description: 'A transaction id is required to unlock a utxo',
    error: [400, 'ExpectedUnspentTransactionIdToUnlockUtxo'],
  },
  {
    args: makeArgs({transaction_vout: undefined}),
    description: 'A transaction id is required to unlock a utxo',
    error: [400, 'ExpectedTransactionOutputIndexToUnlockUtxo'],
  },
  {
    args: makeArgs({lnd: {wallet: {releaseOutput: ({}, cbk) => cbk('err')}}}),
    description: 'LND errors are returned',
    error: [503, 'UnexpectedErrorUnlockingUtxo', {err: 'err'}],
  },
  {
    args: makeArgs({}),
    description: 'UTXO is unlocked',
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({deepEqual, end, equal, rejects}) => {
    if (!!error) {
      await rejects(unlockUtxo(args), error, 'Got expected error');
    } else {
      await unlockUtxo(args);
    }

    return end();
  });
});
