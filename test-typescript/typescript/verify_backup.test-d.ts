import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {verifyBackup, VerifyBackupResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const backup = 'string';

// @ts-expect-error
verifyBackup();
// @ts-expect-error
verifyBackup({});
// @ts-expect-error
verifyBackup({backup});
// @ts-expect-error
verifyBackup({lnd});

expectType<VerifyBackupResult>()(await verifyBackup({lnd, backup}));

expectType<void>()(
  verifyBackup({lnd, backup}, (error, result) => {
    expectType<VerifyBackupResult>()(result);
  })
);
