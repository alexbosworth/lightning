const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

/** Convert payment finished details to a finished payment response

  {
    [confirmed]: {
      confirmed_at: <Payment Confirmed At ISO 8601 Date String>
      fee: <Total Fee Tokens Paid Rounded Down Number>
      fee_mtokens: <Total Fee Millitokens Paid String>
      hops: [{
        channel: <First Route Standard Format Channel Id String>
        channel_capacity: <First Route Channel Capacity Tokens Number>
        fee: <First Route Fee Tokens Rounded Down Number>
        fee_mtokens: <First Route Fee Millitokens String>
        forward_mtokens: <First Route Forward Millitokens String>
        public_key: <First Route Public Key Hex String>
        timeout: <First Route Timeout Block Height Number>
      }]
      id: <Payment Hash Hex String>
      mtokens: <Total Millitokens Paid String>
      paths: [{
        fee_mtokens: <Total Fee Millitokens Paid String>
        hops: [{
          channel: <First Route Standard Format Channel Id String>
          channel_capacity: <First Route Channel Capacity Tokens Number>
          fee: <First Route Fee Tokens Rounded Down Number>
          fee_mtokens: <First Route Fee Millitokens String>
          forward_mtokens: <First Route Forward Millitokens String>
          public_key: <First Route Public Key Hex String>
          timeout: <First Route Timeout Block Height Number>
        }]
        mtokens: <Total Millitokens Paid String>
      }]
      safe_fee: <Total Fee Tokens Paid Rounded Up Number>
      safe_tokens: <Total Tokens Paid, Rounded Up Number>
      secret: <Payment Preimage Hex String>
      timeout: <Expiration Block Height Number>
      tokens: <Total Tokens Paid Rounded Down Number>
    }
    [failed]: {
      is_insufficient_balance: <Failed Due To Lack of Balance Bool>
      is_invalid_payment: <Failed Due to Invalid Payment Bool>
      is_pathfinding_timeout: <Failed Due to Pathfinding Timeout Bool>
      is_route_not_found: <Failed Due to Route Not Found Bool>
      [route]: {
        fee: <Route Total Fee Tokens Rounded Down Number>
        fee_mtokens: <Route Total Fee Millitokens String>
        hops: [{
          channel: <Standard Format Channel Id String>
          channel_capacity: <Channel Capacity Tokens Number>
          fee: <Hop Forwarding Fee Rounded Down Tokens Number>
          fee_mtokens: <Hop Forwarding Fee Millitokens String>
          forward: <Hop Forwarding Tokens Rounded Down Number>
          forward_mtokens: <Hop Forwarding Millitokens String>
          public_key: <Hop Sending To Public Key Hex String>
          timeout: <Hop CTLV Expiration Height Number>
        }]
        mtokens: <Payment Sending Millitokens String>
        safe_fee: <Payment Forwarding Fee Rounded Up Tokens Number>
        safe_tokens: <Payment Sending Tokens Rounded Up Number>
        timeout: <Payment CLTV Expiration Height Number>
        tokens: <Payment Sending Tokens Rounded Down Number>
      }
    }
  }

  @returns via cbk or Promise
  {
    confirmed_at: <Payment Confirmed At ISO 8601 Date String>
    fee: <Fee Tokens Number>
    fee_mtokens: <Total Fee Millitokens To Pay String>
    hops: [{
      channel: <Standard Format Channel Id String>
      channel_capacity: <Channel Capacity Tokens Number>
      fee_mtokens: <Fee Millitokens String>
      forward_mtokens: <Forward Millitokens String>
      public_key: <Public Key Hex String>
      timeout: <Timeout Block Height Number>
    }]
    [id]: <Payment Hash Hex String>
    mtokens: <Total Millitokens Paid String>
    paths: [{
      fee_mtokens: <Total Fee Millitokens Paid String>
      hops: [{
        channel: <First Route Standard Format Channel Id String>
        channel_capacity: <First Route Channel Capacity Tokens Number>
        fee: <First Route Fee Tokens Rounded Down Number>
        fee_mtokens: <First Route Fee Millitokens String>
        forward_mtokens: <First Route Forward Millitokens String>
        public_key: <First Route Public Key Hex String>
        timeout: <First Route Timeout Block Height Number>
      }]
      mtokens: <Total Millitokens Paid String>
    }]
    safe_fee: <Payment Forwarding Fee Rounded Up Tokens Number>
    safe_tokens: <Payment Tokens Rounded Up Number>
    secret: <Payment Preimage Hex String>
    timeout: <Expiration Block Height Number>
    tokens: <Tokens Paid Rounded Down Number>
  }
*/
module.exports = ({confirmed, failed}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Determine if there is an error
      checkFailure: cbk => {
        if (!confirmed && !failed) {
          return cbk([503, 'UnexpectedOutcomeOfPayViaDetails']);
        }

        // Exit early when the payment didn't fail
        if (!failed) {
          return cbk();
        }

        if (!!failed.is_insufficient_balance) {
          return cbk([503, 'InsufficientBalanceToAttemptPayment']);
        }

        if (!!failed.is_invalid_payment) {
          return cbk([503, 'PaymentRejectedByDestination']);
        }

        if (!!failed.is_pathfinding_timeout) {
          return cbk([503, 'PaymentAttemptsTimedOut']);
        }

        if (!!failed.is_route_not_found) {
          return cbk([503, 'PaymentPathfindingFailedToFindPossibleRoute']);
        }

        return cbk([503, 'FailedToFindPayableRouteToDestination']);
      },

      // Return the payment resolution
      payment: ['checkFailure', ({}, cbk) => {
        return cbk(null, {
          confirmed_at: confirmed.confirmed_at,
          fee: confirmed.fee,
          fee_mtokens: confirmed.fee_mtokens,
          hops: confirmed.hops,
          id: confirmed.id,
          mtokens: confirmed.mtokens,
          paths: confirmed.paths,
          secret: confirmed.secret,
          safe_fee: confirmed.safe_fee,
          safe_tokens: confirmed.safe_tokens,
          timeout: confirmed.timeout,
          tokens: confirmed.tokens,
        });
      }],
    },
    returnResult({reject, resolve, of: 'payment'}, cbk));
  });
};
