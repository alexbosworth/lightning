import {expectError, expectType} from 'tsd';
import {deleteFailedPayAttempts} from '../../lnd_methods';
import {AuthenticatedLnd} from '../../lnd_grpc';

const lnd = {} as AuthenticatedLnd;

expectError(deleteFailedPayAttempts());
expectError(deleteFailedPayAttempts({}));

expectType<void>(await deleteFailedPayAttempts({lnd}));
expectType<void>(deleteFailedPayAttempts({lnd}, () => {}));
