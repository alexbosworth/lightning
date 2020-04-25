const {paymentStates} = require('./constants');

/** Payment state as payment failure

  Payment states are returned by LND 0.9.2 and below

  {
    state: <Payment Status State String>
  }

  @returns
  {
     is_insufficient_balance: <Payment Failed Due to Insufficient Balance Bool>
     is_invalid_payment: <Payment Failed Due to Invalid Details Rejection Bool>
     is_pathfinding_timeout: <Failure Due To Pathfinding Timeout Failure Bool>
     is_route_not_found: <Failure Due to No Route To Destination Found Bool>
  }
*/
module.exports = ({state}) => {
  return {
    is_insufficient_balance: state === paymentStates.insufficient_balance,
    is_invalid_payment: state === paymentStates.invalid_payment,
    is_pathfinding_timeout: state === paymentStates.pathfinding_timeout_failed,
    is_route_not_found: state === paymentStates.pathfinding_routes_failed,
  };
};
