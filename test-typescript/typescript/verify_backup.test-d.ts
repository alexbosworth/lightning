import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {verifyBackup, VerifyBackupResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const backup = 'string';

expectError(verifyBackup());
expectError(verifyBackup({}));
expectError(verifyBackup({backup}));
expectError(verifyBackup({lnd}));

expectType<VerifyBackupResult>(await verifyBackup({lnd, backup}));

expectType<void>(
  verifyBackup({lnd, backup}, (error, result) => {
    expectType<VerifyBackupResult>(result);
  })
);
