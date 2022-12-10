const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');
const listPayments = require('./list_payments');

const method = 'listPayments';
const type = 'default';

/** Get failed payments made through channels.

  Requires `offchain:read` permission

  `created_after` is not supported on LND 0.15.5 and below
  `created_before` is not supported on LND 0.15.5 and below

  {
    [created_after]: <Creation Date After or Equal to ISO 8601 Date String>
    [created_before]: <Creation Date Before or Equal to ISO 8601 Date String>
    [limit]: <Page Result Limit Number>
    lnd: <Authenticated LND API Object>
    [token]: <Opaque Paging Token String>
  }

  @returns via cbk or Promise
  {
    payments: [{
      attempts: [{
        [failure]: {
          code: <Error Type Code Number>
          [details]: {
            [channel]: <Standard Format Channel Id String>
            [height]: <Error Associated Block Height Number>
            [index]: <Failed Hop Index Number>
            [mtokens]: <Error Millitokens String>
            [policy]: {
              base_fee_mtokens: <Base Fee Millitokens String>
              cltv_delta: <Locktime Delta Number>
              fee_rate: <Fees Charged in Millitokens Per Million Number>
              [is_disabled]: <Channel is Disabled Bool>
              max_htlc_mtokens: <Maximum HLTC Millitokens Value String>
              min_htlc_mtokens: <Minimum HTLC Millitokens Value String>
              updated_at: <Updated At ISO 8601 Date String>
            }
            [timeout_height]: <Error CLTV Timeout Height Number>
            [update]: {
              chain: <Chain Id Hex String>
              channel_flags: <Channel Flags Number>
              extra_opaque_data: <Extra Opaque Data Hex String>
              message_flags: <Message Flags Number>
              signature: <Channel Update Signature Hex String>
            }
          }
          message: <Error Message String>
        }
        [index]: <Payment Add Index Number>
        [confirmed_at]: <Payment Attempt Succeeded At ISO 8601 Date String>
        created_at: <Attempt Was Started At ISO 8601 Date String>
        [failed_at]: <Payment Attempt Failed At ISO 8601 Date String>
        is_confirmed: <Payment Attempt Succeeded Bool>
        is_failed: <Payment Attempt Failed Bool>
        is_pending: <Payment Attempt is Waiting For Resolution Bool>
        route: {
          fee: <Route Fee Tokens Number>
          fee_mtokens: <Route Fee Millitokens String>
          hops: [{
            channel: <Standard Format Channel Id String>
            channel_capacity: <Channel Capacity Tokens Number>
            fee: <Fee Number>
            fee_mtokens: <Fee Millitokens String>
            forward: <Forward Tokens Number>
            forward_mtokens: <Forward Millitokens String>
            [public_key]: <Forward Edge Public Key Hex String>
            [timeout]: <Timeout Block Height Number>
          }]
          mtokens: <Total Fee-Inclusive Millitokens String>
          [payment]: <Payment Identifier Hex String>
          timeout: <Timeout Block Height Number>
          tokens: <Total Fee-Inclusive Tokens Number>
          [total_mtokens]: <Total Millitokens String>
        }
      }]
      created_at: <Payment at ISO-8601 Date String>
      [destination]: <Destination Node Public Key Hex String>
      id: <Payment Preimage Hash String>
      [index]: <Payment Add Index Number>
      is_confirmed: <Payment is Confirmed Bool>
      is_outgoing: <Transaction Is Outgoing Bool>
      mtokens: <Millitokens Attempted to Pay to Destination String>
      [request]: <BOLT 11 Payment Request String>
      safe_tokens: <Payment Tokens Attempted to Pay Rounded Up Number>
      tokens: <Rounded Down Tokens Attempted to Pay to Destination Number>
    }]
    [next]: <Next Opaque Paging Token String>
  }
*/
module.exports = (args, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!!args.limit && !!args.token) {
          return cbk([400, 'ExpectedNoLimitWhenPagingPayFailuresWithToken']);
        }

        if (!isLnd({method, type, lnd: args.lnd})) {
          return cbk([400, 'ExpectedLndForGetFailedPaymentsRequest']);
        }

        return cbk();
      },

      // Get all payments
      listPayments: ['validate', ({}, cbk) => {
        return listPayments({
          created_after: args.created_after,
          created_before: args.created_before,
          is_failed: true,
          limit: args.limit,
          lnd: args.lnd,
          token: args.token,
        },
        cbk);
      }],
    },
    returnResult({reject, resolve, of: 'listPayments'}, cbk));
  });
};
