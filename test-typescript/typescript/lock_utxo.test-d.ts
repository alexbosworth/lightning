import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {lockUtxo, LockUtxoResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

const transaction_id = Buffer.alloc(32).toString('hex');
const transaction_vout = 0;
const id = Buffer.alloc(32).toString('hex');

expectError(lockUtxo());
expectError(lockUtxo({}));

expectType<LockUtxoResult>(
  await lockUtxo({lnd, transaction_id, transaction_vout})
);
expectType<LockUtxoResult>(
  await lockUtxo({lnd, transaction_id, transaction_vout, id})
);

expectType<void>(
  lockUtxo({lnd, transaction_id, transaction_vout}, (error, result) => {
    expectType<LockUtxoResult>(result);
  })
);
expectType<void>(
  lockUtxo({lnd, transaction_id, transaction_vout, id}, (error, result) => {
    expectType<LockUtxoResult>(result);
  })
);
