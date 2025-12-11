import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {deletePayment} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const id = '0';

expectError(deletePayment());
expectError(deletePayment({}));
expectError(deletePayment({lnd}));
expectError(deletePayment({id}));

expectType<void>(await deletePayment({lnd, id}));

expectType<void>(deletePayment({lnd, id}, () => {}));
