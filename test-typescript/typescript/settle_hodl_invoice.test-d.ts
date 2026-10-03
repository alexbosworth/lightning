import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {settleHodlInvoice} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const secret = Buffer.alloc(32).toString('hex');

// @ts-expect-error
settleHodlInvoice();
// @ts-expect-error
settleHodlInvoice({});
// @ts-expect-error
settleHodlInvoice({secret});
// @ts-expect-error
settleHodlInvoice({lnd});

expectType<void>()(await settleHodlInvoice({lnd, secret}));

expectType<void>()(settleHodlInvoice({lnd, secret}, error => {}));
