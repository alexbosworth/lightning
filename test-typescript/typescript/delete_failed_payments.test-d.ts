import {expectType} from '../expect';
import {deleteFailedPayments} from '../../lnd_methods';
import {AuthenticatedLnd} from '../../lnd_grpc';

const lnd = {} as AuthenticatedLnd;

// @ts-expect-error
deleteFailedPayments();
// @ts-expect-error
deleteFailedPayments({});

expectType<void>()(await deleteFailedPayments({lnd}));
expectType<void>()(deleteFailedPayments({lnd}, () => {}));
