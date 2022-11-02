const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const finishedPayment = require('./finished_payment');
const {isLnd} = require('./../../lnd_requests');
const subscribeToPayViaRequest = require('./subscribe_to_pay_via_request');

const method = 'sendPaymentV2';
const type = 'router';

/** Pay via payment request

  Requires `offchain:write` permission

  `max_path_mtokens` is not supported in LND 0.12.0 or below

  Preferred `confidence` is not supported on LND 0.14.5 and below

  {
    [confidence]: <Preferred Route Confidence Number Out of One Million Number>
    [incoming_peer]: <Pay Through Specific Final Hop Public Key Hex String>
    lnd: <Authenticated LND API Object>
    [max_fee]: <Maximum Fee Tokens To Pay Number>
    [max_fee_mtokens]: <Maximum Fee Millitokens to Pay String>
    [max_path_mtokens]: <Maximum Millitokens For A Multi-Path Path String>
    [max_paths]: <Maximum Simultaneous Paths Number>
    [max_timeout_height]: <Maximum Height of Payment Timeout Number>
    [messages]: [{
      type: <Message Type Number String>
      value: <Message Raw Value Hex Encoded String>
    }]
    [mtokens]: <Millitokens to Pay String>
    [outgoing_channel]: <Pay Out of Outgoing Channel Id String>
    [outgoing_channels]: [<Pay Out of Outgoing Channel Ids String>]
    [pathfinding_timeout]: <Time to Spend Finding a Route Milliseconds Number>
    request: <BOLT 11 Payment Request String>
    [tokens]: <Tokens To Pay Number>
  }

  @returns via cbk or Promise
  {
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
*/
module.exports = (args, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({method, type, lnd: args.lnd})) {
          return cbk([400, 'ExpectedAuthenticatedLndToPayPaymentRequest']);
        }

        if (!args.request) {
          return cbk([400, 'ExpectedPaymentRequestToPayViaPaymentRequest']);
        }

        return cbk();
      },

      // Pay payment request
      pay: ['validate', ({}, cbk) => {
        const sub = subscribeToPayViaRequest({
          confidence: args.confidence,
          incoming_peer: args.incoming_peer,
          lnd: args.lnd,
          max_fee: args.max_fee,
          max_fee_mtokens: args.max_fee_mtokens,
          max_timeout_height: args.max_timeout_height,
          max_path_mtokens: args.max_path_mtokens,
          max_paths: args.max_paths,
          messages: args.messages,
          mtokens: args.mtokens,
          outgoing_channel: args.outgoing_channel,
          outgoing_channels: args.outgoing_channels,
          pathfinding_timeout: args.pathfinding_timeout,
          request: args.request,
          tokens: args.tokens,
        });

        const finished = (err, res) => {
          if (!!err) {
            return cbk(err);
          }

          return finishedPayment({
            confirmed: res.confirmed,
            failed: res.failed,
          },
          cbk);
        };

        sub.once('confirmed', confirmed => finished(null, {confirmed}));
        sub.once('error', err => finished(err));
        sub.once('failed', failed => finished(null, {failed}));

        return;
      }],
    },
    returnResult({reject, resolve, of: 'pay'}, cbk));
  });
};
