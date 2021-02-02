import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getPayment, GetPaymentResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const id = 'id';

expectError(getPayment());
expectError(getPayment({}));
expectError(getPayment({lnd}));
expectError(getPayment({id}));

expectType<GetPaymentResult>(await getPayment({lnd, id}));

expectType<void>(
  getPayment({lnd, id}, (error, result) => {
    expectType<GetPaymentResult>(result);
  })
);
