const {failureReason} = require('./constants');

const is256Hex = n => !!n && /^[0-9A-F]{64}$/i.test(n);

/** Derive failure status from payment

  {
    failure_reason: <Payment Failure Reason String>
    payment_hash: <Payment SHA256 Hash Hex String>
  }

  @throws
  <Error>

  @returns
  {
    id: <Payment Hash Hex String>
    is_canceled: <Payment Was Canceled Bool>
    is_insufficient_balance: <Payment Failed Due to Insufficient Balance Bool>
    is_invalid_payment: <Payment Failed Due to Invalid Details Rejection Bool>
    is_pathfinding_timeout: <Failure Due To Pathfinding Timeout Failure Bool>
    is_route_not_found: <Failure Due to No Route To Destination Found Bool>
  }
*/
module.exports = payment => {
  const state = payment.failure_reason;

  if (!is256Hex(payment.payment_hash)) {
    throw new Error('ExpectedPaymentHashForPaymentAsFailedPayment');
  }

  return {
    id: payment.payment_hash,
    is_canceled: state === failureReason.canceled,
    is_insufficient_balance: state === failureReason.insufficient_balance,
    is_invalid_payment: state === failureReason.invalid_payment,
    is_pathfinding_timeout: state === failureReason.pathfinding_timeout_failed,
    is_route_not_found: state === failureReason.pathfinding_routes_failed,
  };
};
