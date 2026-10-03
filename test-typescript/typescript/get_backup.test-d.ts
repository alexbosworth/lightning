import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getBackup, GetBackupResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const transaction_id = 'id';
const transaction_vout = 0;

// @ts-expect-error
getBackup();
// @ts-expect-error
getBackup({});
// @ts-expect-error
getBackup({transaction_id});
// @ts-expect-error
getBackup({transaction_id, transaction_vout});
// @ts-expect-error
getBackup({lnd});
// @ts-expect-error
getBackup({lnd, transaction_id});
// @ts-expect-error
getBackup({lnd, transaction_vout});

expectType<GetBackupResult>()(
  await getBackup({lnd, transaction_id, transaction_vout})
);

expectType<void>()(
  getBackup({lnd, transaction_id, transaction_vout}, (error, result) => {
    expectType<GetBackupResult>()(result);
  })
);
