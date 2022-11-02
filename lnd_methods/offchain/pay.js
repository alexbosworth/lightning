const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const payViaPaymentRequest = require('./pay_via_payment_request');
const payViaRoutes = require('./pay_via_routes');

/** Make a payment.

  Either a payment path or a BOLT 11 payment request is required

  For paying to private destinations along set paths, a public key in the route
  hops is required to form the route.

  Note: `hops` only returns the first path in the case of multiple paths

  Requires `offchain:write` permission

  `max_path_mtokens` is not supported in LND 0.12.0 or below

  Preferred `confidence` is not supported on LND 0.14.5 and below

  {
    [confidence]: <Preferred Route Confidence Number Out of One Million Number>
    [incoming_peer]: <Pay Through Specific Final Hop Public Key Hex String>
    lnd: <Authenticated LND API Object>
    [max_fee]: <Maximum Additional Fee Tokens To Pay Number>
    [max_fee_mtokens]: <Maximum Fee Millitokens to Pay String>
    [max_path_mtokens]: <Maximum Millitokens For A Multi-Path Path String>
    [max_paths]: <Maximum Simultaneous Paths Number>
    [max_timeout_height]: <Max CLTV Timeout Number>
    [messages]: [{
      type: <Message Type Number String>
      value: <Message Raw Value Hex Encoded String>
    }]
    [mtokens]: <Millitokens to Pay String>
    [outgoing_channel]: <Pay Through Outbound Standard Channel Id String>
    [outgoing_channels]: [<Pay Out of Outgoing Channel Ids String>]
    [path]: {
      id: <Payment Hash Hex String>
      routes: [{
        fee: <Total Fee Tokens To Pay Number>
        fee_mtokens: <Total Fee Millitokens To Pay String>
        hops: [{
          channel: <Standard Format Channel Id String>
          channel_capacity: <Channel Capacity Tokens Number>
          fee: <Fee Number>
          fee_mtokens: <Fee Millitokens String>
          forward: <Forward Tokens Number>
          forward_mtokens: <Forward Millitokens String>
          [public_key]: <Public Key Hex String>
          timeout: <Timeout Block Height Number>
        }]
        [messages]: [{
          type: <Message Type Number String>
          value: <Message Raw Value Hex Encoded String>
        }]
        mtokens: <Total Millitokens To Pay String>
        [payment]: <Payment Identifier Hex String>
        timeout: <Expiration Block Height Number>
        tokens: <Total Tokens To Pay Number>
      }]
    }
    [pathfinding_timeout]: <Time to Spend Finding a Route Milliseconds Number>
    [request]: <BOLT 11 Payment Request String>
    [tokens]: <Total Tokens To Pay to Payment Request Number>
  }

  @returns via cbk or Promise
  {
    confirmed_at: <Payment Confirmed At ISO 8601 Date String>
    fee: <Fee Paid Tokens Number>
    fee_mtokens: <Fee Paid Millitokens String>
    hops: [{
      channel: <Standard Format Channel Id String>
      channel_capacity: <Hop Channel Capacity Tokens Number>
      fee_mtokens: <Hop Forward Fee Millitokens String>
      forward_mtokens: <Hop Forwarded Millitokens String>
      timeout: <Hop CLTV Expiry Block Height Number>
    }]
    id: <Payment Hash Hex String>
    is_confirmed: <Is Confirmed Bool>
    is_outgoing: <Is Outoing Bool>
    mtokens: <Total Millitokens Sent String>
    [paths]: [{
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
    secret: <Payment Secret Preimage Hex String>
    tokens: <Total Tokens Sent Number>
  }
*/
module.exports = (args, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!args.lnd) {
          return cbk([400, 'ExpectedAuthenticatedLndToMakePayment']);
        }

        if (!args.path && !args.request) {
          return cbk([400, 'ExpectedEitherPathOrRequest']);
        }

        if (!!args.path && !!args.request) {
          return cbk([400, 'ExpectedEitherPathOrRequestNotBoth']);
        }

        return cbk();
      },

      // Pay via request
      payViaRequest: ['validate', ({}, cbk) => {
        if (!args.request) {
          return cbk();
        }

        return payViaPaymentRequest({
          confidence: args.confidence,
          incoming_peer: args.incoming_peer,
          lnd: args.lnd,
          max_fee: args.max_fee,
          max_fee_mtokens: args.max_fee_mtokens,
          max_path_mtokens: args.max_path_mtokens,
          max_paths: args.max_paths,
          max_timeout_height: args.max_timeout_height,
          messages: args.messages,
          mtokens: args.mtokens,
          outgoing_channel: args.outgoing_channel,
          outgoing_channels: args.outgoing_channels,
          pathfinding_timeout: args.pathfinding_timeout,
          request: args.request,
          tokens: args.tokens,
        },
        cbk);
      }],

      // Pay via routes
      payViaRoutes: ['validate', ({}, cbk) => {
        // Exit early when there is no specific path specified
        if (!args.path) {
          return cbk();
        }

        return payViaRoutes({
          id: args.path.id,
          lnd: args.lnd,
          pathfinding_timeout: args.pathfinding_timeout,
          routes: args.path.routes,
        },
        cbk);
      }],

      // Result of payment
      payment: [
        'payViaRequest',
        'payViaRoutes',
        ({payViaRequest, payViaRoutes}, cbk) =>
      {
        const result = payViaRequest || payViaRoutes;

        return cbk(null, {
          confirmed_at: result.confirmed_at,
          fee: result.fee,
          fee_mtokens: result.fee_mtokens,
          hops: result.hops,
          id: result.id,
          is_confirmed: true,
          is_outgoing: true,
          mtokens: result.mtokens,
          paths: result.paths || undefined,
          safe_fee: result.safe_fee,
          safe_tokens: result.safe_tokens,
          secret: result.secret,
          tokens: result.tokens,
        });
      }],
    },
    returnResult({reject, resolve, of: 'payment'}, cbk));
  });
};
