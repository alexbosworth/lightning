const {createHash} = require('crypto');

const asyncAuto = require('async/auto');
const asyncRetry = require('async/retry');
const {returnResult} = require('asyncjs-util');

const {htlcAsPayment} = require('./../../lnd_responses');
const {isLnd} = require('./../../lnd_requests');
const {rpcInvoiceAsInvoice} = require('./../../lnd_responses');
const {sortBy} = require('./../../arrays');

const createdAtSort = array => sortBy({array, attribute: 'created_at'});
const defaultLimit = 100;
const {isArray} = Array;
const isString = n => typeof n === 'string';
const lastPageFirstIndexOffset = 1;
const method = 'listInvoices';
const {parse} = JSON;
const {stringify} = JSON;
const type = 'default';

/** Get all created invoices.

  If a next token is returned, pass it to get another page of invoices.

  Requires `invoices:read` permission

  Invoice `payment` is not supported on LND 0.11.1 and below

  {
    [is_unconfirmed]: <Omit Canceled and Settled Invoices Bool>
    [limit]: <Page Result Limit Number>
    lnd: <Authenticated LND API Object>
    [token]: <Opaque Paging Token String>
  }

  @returns via cbk or Promise
  {
    invoices: [{
      [chain_address]: <Fallback Chain Address String>
      cltv_delta: <Final CLTV Delta Number>
      [confirmed_at]: <Settled at ISO 8601 Date String>
      [confirmed_index]: <Confirmed Index Number>
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
      index: <Index Number>
      [is_canceled]: <Invoice is Canceled Bool>
      is_confirmed: <Invoice is Confirmed Bool>
      [is_held]: <HTLC is Held Bool>
      is_private: <Invoice is Private Bool>
      [is_push]: <Invoice is Push Payment Bool>
      mtokens: <Millitokens String>
      [payment]: <Payment Identifying Secret Hex String>
      payments: [{
        [canceled_at]: <Payment Canceled At ISO 8601 Date String>
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
        [total_mtokens]: <Total Millitokens String>
      }]
      received: <Received Tokens Number>
      received_mtokens: <Received Millitokens String>
      [request]: <Bolt 11 Invoice String>
      secret: <Secret Preimage Hex String>
      tokens: <Tokens Number>
    }]
    [next]: <Next Opaque Paging Token String>
  }
*/
module.exports = (args, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Validate arguments
      validate: cbk => {
        if (!!args.limit && !!args.token) {
          return cbk([400, 'UnexpectedLimitWhenPagingInvoicesWithToken']);
        }

        if (!isLnd({method, type, lnd: args.lnd})) {
          return cbk([400, 'ExpectedLndForInvoiceListing']);
        }

        return cbk();
      },

      // Get the list of invoices
      listInvoices: ['validate', ({}, cbk) => {
        let offset;
        let resultsLimit = args.limit || defaultLimit;

        // When there is a token, parse it out into an offset and a limit
        if (!!args.token) {
          try {
            const pagingToken = parse(args.token);

            offset = pagingToken.offset;
            resultsLimit = pagingToken.limit;
          } catch (err) {
            return cbk([400, 'ExpectedValidPagingTokenForInvoicesReq', {err}]);
          }
        }

        return asyncRetry({}, cbk => {
          return args.lnd[type][method]({
            index_offset: offset || Number(),
            num_max_invoices: resultsLimit,
            pending_only: args.is_unconfirmed === true || undefined,
            reversed: true,
          },
          (err, res) => {
            if (!!err) {
              return cbk([503, 'UnexpectedGetInvoicesError', {err}]);
            }

            if (!res) {
              return cbk([503, 'ExpectedResponseForListInvoicesRequest']);
            }

            if (!isArray(res.invoices)) {
              return cbk([503, 'ExpectedInvoicesListForInvoicesQuery']);
            }

            if (!isString(res.first_index_offset)) {
              return cbk([503, 'ExpectedFirstIndexOffsetForInvoicesQuery']);
            }

            if (!isString(res.last_index_offset)) {
              return cbk([503, 'ExpectedLastIndexOffsetForInvoicesQuery']);
            }

            const offset = Number(res.first_index_offset);

            const token = stringify({offset, limit: resultsLimit});

            return cbk(null, {
              invoices: res.invoices,
              token: offset === lastPageFirstIndexOffset ? undefined : token,
            });
          });
        },
        cbk);
      }],

      // Mapped invoices
      mapped: ['listInvoices', ({listInvoices}, cbk) => {
        try {
          return cbk(null, listInvoices.invoices.map(rpcInvoiceAsInvoice));
        } catch (err) {
          return cbk([503, err.message]);
        }
      }],

      // Sorted invoices
      sorted: ['listInvoices', 'mapped', ({listInvoices, mapped}, cbk) => {
        return cbk(null, {
          invoices: createdAtSort(mapped).sorted.reverse(),
          next: !!mapped.length ? listInvoices.token : undefined,
        });
      }],
    },
    returnResult({reject, resolve, of: 'sorted'}, cbk));
  });
};
