import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getInvoice, GetInvoiceResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const id = Buffer.alloc(32).toString('hex');

// @ts-expect-error
getInvoice();
// @ts-expect-error
getInvoice({});
// @ts-expect-error
getInvoice({id});
// @ts-expect-error
getInvoice({lnd});

expectType<GetInvoiceResult>()(await getInvoice({lnd, id}));

expectType<void>()(
  getInvoice({lnd, id}, (error, result) => {
    expectType<GetInvoiceResult>()(result);
  })
);
