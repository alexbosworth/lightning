import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getBackup, GetBackupResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const transaction_id = 'id';
const transaction_vout = 0;

expectError(getBackup());
expectError(getBackup({}));
expectError(getBackup({transaction_id}));
expectError(getBackup({transaction_id, transaction_vout}));
expectError(getBackup({lnd}));
expectError(getBackup({lnd, transaction_id}));
expectError(getBackup({lnd, transaction_vout}));

expectType<GetBackupResult>(
  await getBackup({lnd, transaction_id, transaction_vout})
);

expectType<void>(
  getBackup({lnd, transaction_id, transaction_vout}, (error, result) => {
    expectType<GetBackupResult>(result);
  })
);
