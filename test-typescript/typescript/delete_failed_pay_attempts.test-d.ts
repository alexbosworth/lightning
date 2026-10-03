import {expectType} from '../expect';
import {deleteFailedPayAttempts} from '../../lnd_methods';
import {AuthenticatedLnd} from '../../lnd_grpc';

const lnd = {} as AuthenticatedLnd;

// @ts-expect-error
deleteFailedPayAttempts();
// @ts-expect-error
deleteFailedPayAttempts({});

expectType<void>()(await deleteFailedPayAttempts({lnd}));
expectType<void>()(deleteFailedPayAttempts({lnd}, () => {}));
