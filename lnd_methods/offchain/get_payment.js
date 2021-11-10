const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');
const subscribeToPastPayment = require('./subscribe_to_past_payment');

const isHash = n => !!n && /^[0-9A-F]{64}$/i.test(n);
const method = 'trackPaymentV2';
const type = 'router';

/** Get the status of a past payment

  Requires `offchain:read` permission

  {
    id: <Payment Preimage Hash Hex String>
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
  {
    [failed]: {
      is_insufficient_balance: <Failed Due To Lack of Balance Bool>
      is_invalid_payment: <Failed Due to Payment Rejected At Destination Bool>
      is_pathfinding_timeout: <Failed Due to Pathfinding Timeout Bool>
      is_route_not_found: <Failed Due to Absence of Path Through Graph Bool>
    }
    [is_confirmed]: <Payment Is Settled Bool>
    [is_failed]: <Payment Is Failed Bool>
    [is_pending]: <Payment Is Pending Bool>
    [payment]: {
      confirmed_at: <Payment Confirmed At ISO 8601 Date String>
      created_at: <Payment Created At ISO 8601 Date String>
      destination: <Payment Destination Hex String>
      fee: <Total Fees Paid Rounded Down Number>
      fee_mtokens: <Total Fee Millitokens Paid String>
      hops: [{
        channel: <Standard Format Channel Id String>
        channel_capacity: <Channel Capacity Tokens Number>
        fee: <Routing Fee Tokens Number>
        fee_mtokens: <Fee Millitokens String>
        forward: <Forwarded Tokens Number>
        forward_mtokens: <Forward Millitokens String>
        public_key: <Public Key Hex String>
        timeout: <Timeout Block Height Number>
      }]
      id: <Payment Hash Hex String>
      mtokens: <Total Millitokens Paid String>
      paths: [{
        fee_mtokens: <Total Fee Millitokens Paid String>
        hops: [{
          channel: <Standard Format Channel Id String>
          channel_capacity: <Channel Capacity Tokens Number>
          fee: <Fee Tokens Rounded Down Number>
          fee_mtokens: <Fee Millitokens String>
          forward: <Forwarded Tokens Number>
          forward_mtokens: <Forward Millitokens String>
          public_key: <Public Key Hex String>
          timeout: <Timeout Block Height Number>
        }]
        mtokens: <Total Millitokens Paid String>
      }]
      [request]: <BOLT 11 Encoded Payment Request String>
      safe_fee: <Payment Forwarding Fee Rounded Up Tokens Number>
      safe_tokens: <Payment Tokens Rounded Up Number>
      secret: <Payment Preimage Hex String>
      timeout: <Expiration Block Height Number>
      tokens: <Total Tokens Paid Number>
    }
    [pending]: {
      created_at: <Payment Created At ISO 8601 Date String>
      destination: <Payment Destination Hex String>
      id: <Payment Hash Hex String>
      mtokens: <Total Millitokens Pending String>
      paths: [{
        fee_mtokens: <Total Fee Millitokens Paid String>
        hops: [{
          channel: <Standard Format Channel Id String>
          channel_capacity: <Channel Capacity Tokens Number>
          fee: <Fee Tokens Rounded Down Number>
          fee_mtokens: <Fee Millitokens String>
          forward: <Forwarded Tokens Number>
          forward_mtokens: <Forward Millitokens String>
          public_key: <Public Key Hex String>
          timeout: <Timeout Block Height Number>
        }]
        mtokens: <Total Millitokens Pending String>
      }]
      [request]: <BOLT 11 Encoded Payment Request String>
      safe_tokens: <Payment Tokens Rounded Up Number>
      [timeout]: <Expiration Block Height Number>
      tokens: <Total Tokens Pending Number>
    }
  }
*/
module.exports = ({id, lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isHash(id)) {
          return cbk([400, 'ExpectedPaymentHashToLookupPastPaymentStatus']);
        }

        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedLndGrpcApiObjectToLookupPayment']);
        }

        return cbk();
      },

      // Get payment status
      getStatus: ['validate', ({}, cbk) => {
        const sub = subscribeToPastPayment({id, lnd});

        const finished = (err, res) => {
          sub.removeAllListeners();

          if (!!err) {
            return cbk(err);
          }

          return cbk(null, {
            failed: res.failed || undefined,
            is_confirmed: !!res.payment,
            is_failed: !!res.failed,
            is_pending: !res.payment && !res.failed,
            payment: res.payment || undefined,
            pending: res.pending || undefined,
          });
        };

        sub.once('confirmed', payment => finished(null, {payment}));
        sub.once('end', () => cbk([503, 'UnknownStatusOfPayment']));
        sub.once('error', err => finished(err));
        sub.once('failed', failed => finished(null, {failed}));
        sub.once('paying', pending => finished(null, {pending}));

        return;
      }],
    },
    returnResult({reject, resolve, of: 'getStatus'}, cbk));
  });
};
