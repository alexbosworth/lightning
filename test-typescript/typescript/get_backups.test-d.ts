import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getBackups, GetBackupsResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

// @ts-expect-error
getBackups();
// @ts-expect-error
getBackups({});

expectType<GetBackupsResult>()(await getBackups({lnd}));

expectType<void>()(
  getBackups({lnd}, (error, result) => {
    expectType<GetBackupsResult>()(result);
  })
);
