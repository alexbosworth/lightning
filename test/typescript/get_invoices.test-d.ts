import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getInvoices, GetInvoicesResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const limit = 100;
const token = 'token';

expectError(getInvoices());
expectError(getInvoices({}));
expectError(getInvoices({lnd, limit, token}));

expectType<GetInvoicesResult>(await getInvoices({lnd}));
expectType<GetInvoicesResult>(await getInvoices({lnd, limit}));
expectType<GetInvoicesResult>(await getInvoices({lnd, token}));

expectType<void>(
  getInvoices({lnd}, (error, result) => {
    expectType<GetInvoicesResult>(result);
  })
);
expectType<void>(
  getInvoices({lnd, limit}, (error, result) => {
    expectType<GetInvoicesResult>(result);
  })
);
expectType<void>(
  getInvoices({lnd, token}, (error, result) => {
    expectType<GetInvoicesResult>(result);
  })
);
