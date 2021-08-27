const {test} = require('@alexbosworth/tap');

const {lockUtxo} = require('./../../../lnd_methods');

const id = Buffer.alloc(32).toString('hex');

const makeArgs = overrides => {
  const args = {
    lnd: {wallet: {leaseOutput: ({}, cbk) => cbk(null, {expiration: '1'})}},
    transaction_id: id,
    transaction_vout: 0,
  };

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const tests = [
  {
    args: makeArgs({lnd: undefined}),
    description: 'LND is required to lock a utxo',
    error: [400, 'ExpectedLndToLockUtxo'],
  },
  {
    args: makeArgs({transaction_id: undefined}),
    description: 'A transaction id is required to lock a utxo',
    error: [400, 'ExpectedUnspentTransactionIdToLockUtxo'],
  },
  {
    args: makeArgs({transaction_vout: undefined}),
    description: 'A transaction id is required to lock a utxo',
    error: [400, 'ExpectedTransactionOutputIndexToLockUtxo'],
  },
  {
    args: makeArgs({
      lnd: {wallet: {leaseOutput: ({}, cbk) => cbk({details: 'unknown'})}},
    }),
    description: 'LND unknown service errors are returned',
    error: [501, 'BackingLndDoesNotSupportLockingUtxos'],
  },
  {
    args: makeArgs({
      lnd: {wallet: {leaseOutput: ({}, cbk) => cbk({
        details: 'unknown output',
      })}},
    }),
    description: 'Locking unknown output returns unknown output error',
    error: [404, 'OutpointToLockNotFoundInUtxoSet'],
  },
  {
    args: makeArgs({lnd: {wallet: {leaseOutput: ({}, cbk) => cbk('err')}}}),
    description: 'LND errors are returned',
    error: [503, 'UnexpectedErrorLockingUtxo', {err: 'err'}],
  },
  {
    args: makeArgs({lnd: {wallet: {leaseOutput: ({}, cbk) => cbk()}}}),
    description: 'A response is expected',
    error: [503, 'ExpectedResponseToLockUtxoRequest'],
  },
  {
    args: makeArgs({lnd: {wallet: {leaseOutput: ({}, cbk) => cbk(null, {})}}}),
    description: 'An expiration is expected',
    error: [503, 'ExpectedExpirationDateForLockedUtxo'],
  },
  {
    args: makeArgs({id: Buffer.alloc(32).toString('hex')}),
    description: 'UTXO is locked',
    expected: {
      expires_at: '1970-01-01T00:00:01.000Z',
      id: Buffer.alloc(32).toString('hex'),
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, rejects, strictSame}) => {
    if (!!error) {
      await rejects(lockUtxo(args), error, 'Got expected error');
    } else {
      const got = await lockUtxo(args);

      strictSame(got, expected, 'Got expected result');
    }

    return end();
  });
});
