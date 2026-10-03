import {expectType} from '../expect';
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

// @ts-expect-error
verifyBackups();
// @ts-expect-error
verifyBackups({});
// @ts-expect-error
verifyBackups({channels});
// @ts-expect-error
verifyBackups({backup, channels});
// @ts-expect-error
verifyBackups({backup});
// @ts-expect-error
verifyBackups({lnd});
// @ts-expect-error
verifyBackups({lnd, backup});
// @ts-expect-error
verifyBackups({lnd, channels});

expectType<VerifyBackupsResult>()(await verifyBackups({lnd, backup, channels}));

expectType<void>()(
  verifyBackups({lnd, backup, channels}, (error, result) => {
    expectType<VerifyBackupsResult>()(result);
  })
);
