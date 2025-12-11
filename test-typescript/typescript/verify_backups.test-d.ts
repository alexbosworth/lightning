import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {verifyBackups, VerifyBackupsResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const backup = 'backup';
const channels = [
  {
    transaction_id: '1',
    transaction_vout: 1,
  },
];

expectError(verifyBackups());
expectError(verifyBackups({}));
expectError(verifyBackups({channels}));
expectError(verifyBackups({backup, channels}));
expectError(verifyBackups({backup}));
expectError(verifyBackups({lnd}));
expectError(verifyBackups({lnd, backup}));
expectError(verifyBackups({lnd, channels}));

expectType<VerifyBackupsResult>(await verifyBackups({lnd, backup, channels}));

expectType<void>(
  verifyBackups({lnd, backup, channels}, (error, result) => {
    expectType<VerifyBackupsResult>(result);
  })
);
