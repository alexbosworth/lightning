import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getPayment, GetPaymentResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const id = 'id';

// @ts-expect-error
getPayment();
// @ts-expect-error
getPayment({});
// @ts-expect-error
getPayment({lnd});
// @ts-expect-error
getPayment({id});

expectType<GetPaymentResult>()(await getPayment({lnd, id}));

expectType<void>()(
  getPayment({lnd, id}, (error, result) => {
    expectType<GetPaymentResult>()(result);
  })
);
