import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {settleHodlInvoice} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const secret = Buffer.alloc(32).toString('hex');

expectError(settleHodlInvoice());
expectError(settleHodlInvoice({}));
expectError(settleHodlInvoice({secret}));
expectError(settleHodlInvoice({lnd}));

expectType<void>(await settleHodlInvoice({lnd, secret}));

expectType<void>(settleHodlInvoice({lnd, secret}, error => {}));
