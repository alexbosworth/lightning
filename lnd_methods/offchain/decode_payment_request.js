const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');
const {paymentRequestDetails} = require('./../../lnd_responses');

const method = 'decodePayReq';
const type = 'default';

/** Get decoded payment request

  Requires `offchain:read` permission

  {
    lnd: <Authenticated LND API Object>
    request: <BOLT 11 Payment Request String>
  }

  @returns via cbk or Promise
  {
    chain_address: <Fallback Chain Address String>
    [cltv_delta]: <Final CLTV Delta Number>
    created_at: <Payment Request Created At ISO 8601 Date String>
    description: <Payment Description String>
    description_hash: <Payment Longer Description Hash Hex String>
    destination: <Public Key Hex String>
    expires_at: <ISO 8601 Date String>
    features: [{
      bit: <BOLT 09 Feature Bit Number>
      is_known: <Feature is Known Bool>
      is_required: <Feature Support is Required To Pay Bool>
      type: <Feature Type String>
    }]
    id: <Payment Hash Hex String>
    is_expired: <Invoice is Expired Bool>
    mtokens: <Requested Millitokens String>
    [payment]: <Payment Identifier Hex Encoded String>
    routes: [[{
      [base_fee_mtokens]: <Base Routing Fee In Millitokens String>
      [channel]: <Standard Format Channel Id String>
      [cltv_delta]: <CLTV Blocks Delta Number>
      [fee_rate]: <Fee Rate In Millitokens Per Million Number>
      public_key: <Forward Edge Public Key Hex String>
    }]]
    safe_tokens: <Requested Tokens Rounded Up Number>
    tokens: <Requested Tokens Rounded Down Number>
  }
*/
module.exports = ({lnd, request}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedLndForDecodingPaymentRequest']);
        }

        if (!request) {
          return cbk([400, 'ExpectedPaymentRequestToDecode']);
        }

        return cbk();
      },

      // Decode payment request
      decode: ['validate', ({}, cbk) => {
        return lnd[type][method]({pay_req: request}, (err, res) => {
          if (!!err) {
            return cbk([503, 'UnexpectedDecodePaymentRequestError', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedResponseFromDecodePaymentRequest']);
          }

          try {
            return cbk(null, paymentRequestDetails(res));
          } catch (err) {
            return cbk([503, err.message]);
          }
        });
      }],
    },
    returnResult({reject, resolve, of: 'decode'}, cbk));
  });
};
