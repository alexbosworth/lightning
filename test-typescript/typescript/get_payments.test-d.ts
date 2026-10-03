import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getPayments, GetPaymentsResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const limit = 1;
const token = 'token';

// @ts-expect-error
getPayments();
// @ts-expect-error
getPayments({});
// @ts-expect-error
getPayments({lnd, limit, token});

expectType<GetPaymentsResult>()(await getPayments({lnd}));
expectType<GetPaymentsResult>()(await getPayments({lnd, limit}));
expectType<GetPaymentsResult>()(await getPayments({lnd, token}));

expectType<void>()(
  getPayments({lnd}, (error, result) => {
    expectType<GetPaymentsResult>()(result);
  })
);
expectType<void>()(
  getPayments({lnd, limit}, (error, result) => {
    expectType<GetPaymentsResult>()(result);
  })
);
expectType<void>()(
  getPayments({lnd, token}, (error, result) => {
    expectType<GetPaymentsResult>()(result);
  })
);
