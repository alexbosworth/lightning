import {expectError, expectType} from 'tsd';
import {failureFromPayment} from '../../lnd_responses/failure_from_payment';

expectError(failureFromPayment());
expectError(failureFromPayment({}));
expectError(failureFromPayment({failure_reason: 'invalid failure reason'}));

expectType<{
  is_insufficient_balance: boolean;
  is_invalid_payment: boolean;
  is_pathfinding_timeout: boolean;
  is_route_not_found: boolean;
}>(failureFromPayment({failure_reason: 'FAILURE_REASON_NONE'}));
expectType<{
  is_insufficient_balance: true;
  is_invalid_payment: false;
  is_pathfinding_timeout: false;
  is_route_not_found: false;
}>(failureFromPayment({failure_reason: 'FAILURE_REASON_INSUFFICIENT_BALANCE'}));
expectType<{
  is_insufficient_balance: false;
  is_invalid_payment: true;
  is_pathfinding_timeout: false;
  is_route_not_found: false;
}>(
  failureFromPayment({
    failure_reason: 'FAILURE_REASON_INCORRECT_PAYMENT_DETAILS',
  })
);
expectType<{
  is_insufficient_balance: false;
  is_invalid_payment: false;
  is_pathfinding_timeout: true;
  is_route_not_found: false;
}>(failureFromPayment({failure_reason: 'FAILURE_REASON_TIMEOUT'}));
expectType<{
  is_insufficient_balance: false;
  is_invalid_payment: false;
  is_pathfinding_timeout: false;
  is_route_not_found: true;
}>(failureFromPayment({failure_reason: 'FAILURE_REASON_NO_ROUTE'}));
