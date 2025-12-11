import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {deletePayments} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

expectError(deletePayments());
expectError(deletePayments({}));

expectType<void>(await deletePayments({lnd}));

expectType<void>(deletePayments({lnd}, () => {}));
