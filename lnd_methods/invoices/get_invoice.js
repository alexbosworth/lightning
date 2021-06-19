const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');
const {rpcInvoiceAsInvoice} = require('./../../lnd_responses');

const isHash = n => /^[0-9A-F]{64}$/i.test(n);

/** Lookup a channel invoice.

  The received value and the invoiced value may differ as invoices may be
  over-paid.

  Requires `invoices:read` permission

  `payment` is not supported on LND 0.11.1 and below

  {
    id: <Payment Hash Id Hex String>
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
  {
    [chain_address]: <Fallback Chain Address String>
    cltv_delta: <CLTV Delta Number>
    [confirmed_at]: <Settled at ISO 8601 Date String>
    created_at: <ISO 8601 Date String>
    description: <Description String>
    [description_hash]: <Description Hash Hex String>
    expires_at: <ISO 8601 Date String>
    features: [{
      bit: <BOLT 09 Feature Bit Number>
      is_known: <Feature is Known Bool>
      is_required: <Feature Support is Required To Pay Bool>
      type: <Feature Type String>
    }]
    id: <Payment Hash Hex String>
    [is_canceled]: <Invoice is Canceled Bool>
    is_confirmed: <Invoice is Confirmed Bool>
    [is_held]: <HTLC is Held Bool>
    is_outgoing: <Invoice is Outgoing Bool>
    is_private: <Invoice is Private Bool>
    [is_push]: <Invoice is Push Payment Bool>
    mtokens: <Millitokens String>
    [payment]: <Payment Identifying Secret Hex String>
    payments: [{
      [confirmed_at]: <Payment Settled At ISO 8601 Date String>
      created_at: <Payment Held Since ISO 860 Date String>
      created_height: <Payment Held Since Block Height Number>
      in_channel: <Incoming Payment Through Channel Id String>
      is_canceled: <Payment is Canceled Bool>
      is_confirmed: <Payment is Confirmed Bool>
      is_held: <Payment is Held Bool>
      messages: [{
        type: <Message Type Number String>
        value: <Raw Value Hex String>
      }]
      mtokens: <Incoming Payment Millitokens String>
      [pending_index]: <Pending Payment Channel HTLC Index Number>
      timeout: <HTLC CLTV Timeout Height Number>
      tokens: <Payment Tokens Number>
    }]
    received: <Received Tokens Number>
    received_mtokens: <Received Millitokens String>
    [request]: <Bolt 11 Invoice String>
    secret: <Secret Preimage Hex String>
    tokens: <Tokens Number>
  }
*/
module.exports = ({id, lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!id || !isHash(id)) {
          return cbk([400, 'ExpectedIdToGetInvoiceDetails']);
        }

        if (!isLnd({lnd, method: 'lookupInvoice', type: 'default'})) {
          return cbk([400, 'ExpectedLndToGetInvoiceDetails']);
        }

        return cbk();
      },

      // Get the invoice
      getInvoice: ['validate', ({}, cbk) => {
        return lnd.default.lookupInvoice({
          r_hash: Buffer.from(id, 'hex'),
        },
        (err, response) => {
          if (!!err) {
            return cbk([503, 'UnexpectedLookupInvoiceErr', {err}]);
          }

          try {
            return cbk(null, rpcInvoiceAsInvoice(response));
          } catch (err) {
            return cbk([503, err.message]);
          }
        });
      }],
    },
    returnResult({reject, resolve, of: 'getInvoice'}, cbk));
  });
};
