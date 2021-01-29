import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getBackups, GetBackupsResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

expectError(getBackups());
expectError(getBackups({}));

expectType<GetBackupsResult>(await getBackups({lnd}));

expectType<void>(
  getBackups({lnd}, (error, result) => {
    expectType<GetBackupsResult>(result);
  })
);
