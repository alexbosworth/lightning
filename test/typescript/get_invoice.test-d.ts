import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getInvoice, GetInvoiceResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const id = Buffer.alloc(32).toString('hex');

expectError(getInvoice());
expectError(getInvoice({}));
expectError(getInvoice({id}));
expectError(getInvoice({lnd}));

expectType<GetInvoiceResult>(await getInvoice({lnd, id}));

expectType<void>(
  getInvoice({lnd, id}, (error, result) => {
    expectType<GetInvoiceResult>(result);
  })
);
