import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getFailedPayments, GetFailedPaymentsResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const limit = 1;
const token = 'token';

expectError(getFailedPayments());
expectError(getFailedPayments({}));
expectError(getFailedPayments({lnd, limit, token})); // ExpectedNoLimitWhenPagingPayFailuresWithToken

expectType<GetFailedPaymentsResult>(await getFailedPayments({lnd}));
expectType<GetFailedPaymentsResult>(await getFailedPayments({lnd, limit}));
expectType<GetFailedPaymentsResult>(await getFailedPayments({lnd, token}));

expectType<void>(
  getFailedPayments({lnd}, (error, result) => {
    expectType<GetFailedPaymentsResult>(result);
  })
);
expectType<void>(
  getFailedPayments({lnd, limit}, (error, result) => {
    expectType<GetFailedPaymentsResult>(result);
  })
);
expectType<void>(
  getFailedPayments({lnd, token}, (error, result) => {
    expectType<GetFailedPaymentsResult>(result);
  })
);
