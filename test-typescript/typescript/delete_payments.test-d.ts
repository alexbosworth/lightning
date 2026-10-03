import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {deletePayments} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

// @ts-expect-error
deletePayments();
// @ts-expect-error
deletePayments({});

expectType<void>()(await deletePayments({lnd}));

expectType<void>()(deletePayments({lnd}, () => {}));
