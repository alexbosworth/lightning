import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {deletePayment} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const id = '0';

// @ts-expect-error
deletePayment();
// @ts-expect-error
deletePayment({});
// @ts-expect-error
deletePayment({lnd});
// @ts-expect-error
deletePayment({id});

expectType<void>()(await deletePayment({lnd, id}));

expectType<void>()(deletePayment({lnd, id}, () => {}));
