const asyncAuto = require('async/auto');
const {parsePaymentRequest} = require('invoices');
const {returnResult} = require('asyncjs-util');

const {createChainAddress} = require('./../address');
const getInvoice = require('./get_invoice');
const {isLnd} = require('./../../lnd_requests');
const {mtokensAmount} = require('./../../bolt00');

const defaultExpirySec = 60 * 60 * 3;
const hexAsBuffer = hex => !!hex ? Buffer.from(hex, 'hex') : undefined;
const invoiceExistsError = 'invoice with payment hash already exists';
const {isArray} = Array;
const isHex = n => !(n.length % 2) && /^[0-9A-F]*$/i.test(n);
const method = 'addInvoice';
const msPerSec = 1e3;
const {parse} = Date;
const {round} = Math;
const tokensAsMtok = tokens => (BigInt(tokens) * BigInt(1e3)).toString();
const type = 'default';

/** Create a Lightning invoice.

  Requires `address:write`, `invoices:write` permission

  `payment` is not supported on LND 0.11.1 and below

  {
    [cltv_delta]: <CLTV Delta Number>
    [description]: <Invoice Description String>
    [description_hash]: <Hashed Description of Payment Hex String>
    [expires_at]: <Expires At ISO 8601 Date String>
    [is_fallback_included]: <Is Fallback Address Included Bool>
    [is_fallback_nested]: <Is Fallback Address Nested Bool>
    [is_including_private_channels]: <Invoice Includes Private Channels Bool>
    lnd: <Authenticated LND API Object>
    [secret]: <Payment Preimage Hex String>
    [mtokens]: <Millitokens String>
    [tokens]: <Tokens Number>
  }

  @returns via cbk or Promise
  {
    [chain_address]: <Backup Address String>
    created_at: <ISO 8601 Date String>
    [description]: <Description String>
    id: <Payment Hash Hex String>
    [mtokens]: <Millitokens String>
    [payment]: <Payment Identifying Secret Hex String>
    request: <BOLT 11 Encoded Payment Request String>
    secret: <Hex Encoded Payment Secret String>
    [tokens]: <Tokens Number>
  }
*/
module.exports = (args, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Payment secret for the invoice
      preimage: cbk => {
        if (!args.secret) {
          return cbk();
        }

        if (!isHex(args.secret)) {
          return cbk([400, 'ExpectedHexSecretForNewInvoice']);
        }

        return cbk(null, Buffer.from(args.secret, 'hex'));
      },

      // Check arguments
      validate: cbk => {
        if (!!args.expires_at && new Date().toISOString() > args.expires_at) {
          return cbk([400, 'ExpectedFutureDateForInvoiceExpiration']);
        }

        if (!isLnd({method, type, lnd: args.lnd})) {
          return cbk([400, 'ExpectedLndToCreateNewInvoice']);
        }

        if (!!args.mtokens || args.tokens !== undefined) {
          try {
            mtokensAmount({mtokens: args.mtokens, tokens: args.tokens});
          } catch (err) {
            return cbk([400, err.message]);
          }
        }

        return cbk();
      },

      // Add address for the fallback address
      addAddress: ['validate', ({}, cbk) => {
        // Exit early when no fallback address is needed
        if (!args.is_fallback_included) {
          return cbk();
        }

        const format = !!args.is_fallback_nested ? 'np2wpkh' : 'p2wpkh';

        return createChainAddress({format, lnd: args.lnd}, cbk);
      }],

      // Determine the value of the invoice
      mtokens: ['validate', ({}, cbk) => {
        // Exit early when there are no mtokens
        if (!args.mtokens && args.tokens === undefined) {
          return cbk(null, Number().toString());
        }

        const {mtokens} =  mtokensAmount({
          mtokens: args.mtokens,
          tokens: args.tokens,
        });

        return cbk(null, mtokens);
      }],

      // Add invoice
      addInvoice: [
        'addAddress',
        'mtokens',
        'preimage',
        ({addAddress, mtokens, preimage}, cbk) =>
      {
        const fallbackAddress = !addAddress ? String() : addAddress.address;
        const createdAt = new Date();
        const expireAt = !args.expires_at ? null : parse(args.expires_at);

        const expiryMs = !expireAt ? null : expireAt - createdAt.getTime();

        return args.lnd.default.addInvoice({
          cltv_expiry: !args.cltv_delta ? undefined : args.cltv_delta,
          description_hash: hexAsBuffer(args.description_hash),
          expiry: !expiryMs ? defaultExpirySec : round(expiryMs / msPerSec),
          fallback_addr: fallbackAddress,
          memo: args.description,
          private: !!args.is_including_private_channels,
          r_preimage: preimage || undefined,
          value_msat: mtokens,
        },
        (err, response) => {
          if (!!err && err.details === invoiceExistsError) {
            return cbk([409, 'InvoiceWithGivenHashAlreadyExists']);
          }

          if (!!err) {
            return cbk([503, 'AddInvoiceError', {err}]);
          }

          if (!Buffer.isBuffer(response.payment_addr)) {
            return cbk([503, 'ExpectedPaymentAddressInCreateInvoiceResponse']);
          }

          if (!response.payment_request) {
            return cbk([503, 'ExpectedPaymentRequestForCreatedInvoice']);
          }

          try {
            parsePaymentRequest({request: response.payment_request});
          } catch (err) {
            return cbk([503, 'ExpectedValidPaymentRequestForInvoice']);
          }

          const payment = response.payment_addr.toString('hex');
          const req = parsePaymentRequest({request: response.payment_request});

          return cbk(null, {
            created_at: req.created_at,
            description: args.description,
            id: req.id,
            mtokens: req.mtokens,
            payment: payment || undefined,
            request: response.payment_request,
            tokens: req.tokens,
          });
        });
      }],

      // Get the invoice
      getInvoice: ['addInvoice', ({addInvoice}, cbk) => {
        return getInvoice({lnd: args.lnd, id: addInvoice.id}, cbk);
      }],

      // Final invoice
      invoice: [
        'addAddress',
        'addInvoice',
        'getInvoice',
        ({addAddress, addInvoice, getInvoice}, cbk) =>
      {
        return cbk(null, {
          chain_address: !addAddress ? undefined : addAddress.address,
          created_at: getInvoice.created_at,
          description: addInvoice.description || undefined,
          id: addInvoice.id,
          mtokens: getInvoice.mtokens || Number().toString(),
          payment: addInvoice.payment || undefined,
          request: addInvoice.request,
          secret: getInvoice.secret,
          tokens: addInvoice.tokens || Number(),
        });
      }],
    },
    returnResult({reject, resolve, of: 'invoice'}, cbk));
  });
};
