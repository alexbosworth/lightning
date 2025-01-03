const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

/**
 * Estimate routing fees based on an invoice.
 *
 * Requires `offchain:read` permission
 *
 * This method is not supported before LND 0.18.4
 *
 @argument
 {
    lnd: <Authenticated LND API Object>
    request: <BOLT 11 Payment Request String>
    timeout: <Optional Timeout in Milliseconds Number>
  }

  @returns via cbk or Promise
  {
    fee: <Route Fee Sats Number>
    timeout: <Time Lock Block Height Delay String>
  }
 */
module.exports = ({lnd, request, timeout}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!lnd || !lnd.router) {
          return cbk([400, 'ExpectedAuthenticatedLndForGetRoutingFeeEstimate']);
        }

        if (!request) {
          return cbk([400, 'ExpectedPaymentRequestStringForGetRoutingFeeEstimate']);
        }
        
        if (timeout > 86400000) {
          return cbk([400, 'ExpectedTimeoutLessThanOneDayForGetRoutingFeeEstimate']);
        }

        if (timeout < 1) {
          return cbk([400, 'ExpectedTimeoutGreaterThanZeroForGetRoutingFeeEstimate']);
        }

        timeout = !timeout ? 60 : timeout / 1000;

        return cbk();
      },

      // Estimate route fee and return a successful routing fee and timeout or failure reason
      getEstimate: ['validate', ({}, cbk) => {
        return lnd.router.estimateRouteFee({request, timeout},
          (err, res) => {
            if (err) {
              return cbk([503, 'UnexpectedGetRoutingFeeEstimateError', {err}]);
            }

            if (!res) {
              return cbk([503, 'ExpectedGetRoutingFeeEstimateResponse']);
            }

            const mtokenFee = Number(res.fee);
            if (!mtokenFee) {
              return cbk([503, 'ExpectedFeeInGetRoutingFeeEstimateResponse']);
            }

            if (isNaN(mtokenFee)) {
              return cbk([503, 'ExpectedFeeInGetRoutingFeeEstimateResponseToBeNumber']);
            }

            if (!isFinite(mtokenFee)) {
              return cbk([503, 'ExpectedFeeInGetRoutingFeeEstimateResponseToBeFinite']);
            }

            if (!res.timeout) {
              return cbk([503, 'ExpectedTimeoutInGetRoutingFeeEstimateResponse']);
            }

            if (res.failure_reason !== 'FAILURE_REASON_NONE') {
              return cbk([404, 'GetRoutingFeeEstimateFailed', {failure: res.failure_reason}])
            }

            const fee = mtokenFee > 0 ? mtokenFee / 1000 : mtokenFee;
            return cbk(null, {fee, timeout: res.timeout});
          });
      }],
    },
      returnResult({reject, resolve, of: 'getEstimate'}, cbk));
  });
};
