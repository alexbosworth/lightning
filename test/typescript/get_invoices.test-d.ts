import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getInvoices, GetInvoicesResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const limit = 100;
const token = 'token';
const is_unconfirmed = true;

expectError(getInvoices());
expectError(getInvoices({}));
expectError(getInvoices({lnd, limit, token}));
expectError(getInvoices({lnd, limit, token, is_unconfirmed}));

expectType<GetInvoicesResult>(await getInvoices({lnd}));
expectType<GetInvoicesResult>(await getInvoices({lnd, limit}));
expectType<GetInvoicesResult>(await getInvoices({lnd, limit, is_unconfirmed}));
expectType<GetInvoicesResult>(await getInvoices({lnd, token}));
expectType<GetInvoicesResult>(await getInvoices({lnd, token, is_unconfirmed}));

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
  getInvoices({lnd, limit, is_unconfirmed}, (error, result) => {
    expectType<GetInvoicesResult>(result);
  })
);
expectType<void>(
  getInvoices({lnd, token}, (error, result) => {
    expectType<GetInvoicesResult>(result);
  })
);
expectType<void>(
  getInvoices({lnd, token, is_unconfirmed}, (error, result) => {
    expectType<GetInvoicesResult>(result);
  })
);
