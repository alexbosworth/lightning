const {failureReason} = require('./constants');

/** Derive failure status from payment

  {
    failure_reason: <Payment Failure Reason String>
  }

  @returns
  {
     is_insufficient_balance: <Payment Failed Due to Insufficient Balance Bool>
     is_invalid_payment: <Payment Failed Due to Invalid Details Rejection Bool>
     is_pathfinding_timeout: <Failure Due To Pathfinding Timeout Failure Bool>
     is_route_not_found: <Failure Due to No Route To Destination Found Bool>
  }
*/
module.exports = payment => {
  const state = payment.failure_reason;

  return {
    is_insufficient_balance: state === failureReason.insufficient_balance,
    is_invalid_payment: state === failureReason.invalid_payment,
    is_pathfinding_timeout: state === failureReason.pathfinding_timeout_failed,
    is_route_not_found: state === failureReason.pathfinding_routes_failed,
  };
};
