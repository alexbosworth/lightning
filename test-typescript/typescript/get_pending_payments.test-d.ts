import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getPendingPayments, GetPendingPaymentsResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const limit = 1;
const token = 'token';

expectError(getPendingPayments());
expectError(getPendingPayments({}));
expectError(getPendingPayments({lnd, limit, token})); // ExpectedNoLimitPagingPendingPaymentsWithToken

expectType<GetPendingPaymentsResult>(await getPendingPayments({lnd}));
expectType<GetPendingPaymentsResult>(await getPendingPayments({lnd, limit}));
expectType<GetPendingPaymentsResult>(await getPendingPayments({lnd, token}));

expectType<void>(
  getPendingPayments({lnd}, (error, result) => {
    expectType<GetPendingPaymentsResult>(result);
  })
);
expectType<void>(
  getPendingPayments({lnd, limit}, (error, result) => {
    expectType<GetPendingPaymentsResult>(result);
  })
);
expectType<void>(
  getPendingPayments({lnd, token}, (error, result) => {
    expectType<GetPendingPaymentsResult>(result);
  })
);
