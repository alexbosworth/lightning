import {expectError, expectType} from 'tsd';
import {deleteFailedPayments} from '../../lnd_methods';
import {AuthenticatedLnd} from '../../lnd_grpc';

const lnd = {} as AuthenticatedLnd;

expectError(deleteFailedPayments());
expectError(deleteFailedPayments({}));

expectType<void>(await deleteFailedPayments({lnd}));
expectType<void>(deleteFailedPayments({lnd}, () => {}));
