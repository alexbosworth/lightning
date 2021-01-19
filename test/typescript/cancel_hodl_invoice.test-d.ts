import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {cancelHodlInvoice} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const id = '00';

expectError(cancelHodlInvoice());
expectError(cancelHodlInvoice({}));
expectError(cancelHodlInvoice({id}));
expectError(cancelHodlInvoice({lnd}));

expectType<void>(await cancelHodlInvoice({lnd, id}));
expectType<void>(cancelHodlInvoice({lnd, id}, error => {}));
