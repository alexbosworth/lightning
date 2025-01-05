const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const defaultTimeoutSeconds = 60;
const method = 'estimateRouteFee';
const msAsSecs = ms => Math.round(ms / 1e3);
const type = 'router';

/** Estimate routing fees and timeout required to pay a payment request

  Requires `offchain:read` permission

  This method is not supported on LND 0.18.3 and below

 {
    lnd: <Authenticated LND API Object>
    request: <BOLT 11 Payment Request String>
    [timeout]: <Maximum Route Pathfinding Time in Milliseconds Number>
  }

  @returns via cbk or Promise
  {
    fee_mtokens: <Estimated Minimum Required Route Fee Millitokens String>
    timeout: <Estimated Minimum Time Lock Block Height Delay Number>
  }
*/
module.exports = ({lnd, request, timeout}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedAuthenticatedLndToGetRoutingFeeEstimate']);
        }

        if (!request) {
          return cbk([400, 'ExpectedPaymentRequestToGetRoutingFeeEstimate']);
        }

        return cbk();
      },

      // Request a probe of the request to determine a needed fee and delay
      getEstimate: ['validate', ({}, cbk) => {
        return lnd[type][method]({
          payment_request: request,
          timeout: msAsSecs(timeout) || defaultTimeoutSeconds,
        },
        (err, res) => {
          if (!!err) {
            return cbk([503, 'UnexpectedGetRoutingFeeEstimateError', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedGetRoutingFeeEstimateResponse']);
          }

          if (!res.routing_fee_msat) {
            return cbk([503, 'ExpectedFeeInGetRoutingFeeEstimateResponse']);
          }

          if (!res.time_lock_delay) {
            return cbk([503, 'ExpectedTimeoutInGetRouteFeeEstimateResponse']);
          }

          // Exit early with error when the estimate response has failure code
          if (res.failure_reason !== 'FAILURE_REASON_NONE') {
            return cbk([
              404,
              'RouteToDestinationNotFound',
              {failure: res.failure_reason},
            ]);
          }

          return cbk(null, {
            fee_mtokens: res.routing_fee_msat,
            timeout: Number(res.time_lock_delay),
          });
        });
      }],
    },
    returnResult({reject, resolve, of: 'getEstimate'}, cbk));
  });
};
