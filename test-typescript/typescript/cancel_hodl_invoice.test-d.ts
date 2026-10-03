import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {cancelHodlInvoice} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const id = '00';

// @ts-expect-error
cancelHodlInvoice();
// @ts-expect-error
cancelHodlInvoice({});
// @ts-expect-error
cancelHodlInvoice({id});
// @ts-expect-error
cancelHodlInvoice({lnd});

expectType<void>()(await cancelHodlInvoice({lnd, id}));
expectType<void>()(cancelHodlInvoice({lnd, id}, error => {}));
