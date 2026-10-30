const {createHash} = require('crypto');
const {randomBytes} = require('crypto');

const asyncAuto = require('async/auto');
const asyncify = require('async/asyncify');
const {parsePaymentRequest} = require('invoices');
const {returnResult} = require('asyncjs-util');

const {createChainAddress} = require('./../address');
const {isLnd} = require('./../../lnd_requests');
const {routeHintFromRoute} = require('./../../lnd_requests');

const hexAsBuffer = hex => !!hex ? Buffer.from(hex, 'hex') : undefined;
const {isArray} = Array;
const method = 'addHoldInvoice';
const msPerSec = 1e3;
const mtokensAsTokens = mtokens => Number(BigInt(mtokens) / BigInt(1e3));
const noTokens = 0;
const {parse} = Date;
const preimageByteLength = 32;
const {round} = Math;
const sha256 = preimage => createHash('sha256').update(preimage).digest();
const tokensAsMtok = tokens => (BigInt(tokens) * BigInt(1e3)).toString();
const type = 'invoices';

/** Create HODL invoice. This invoice will not settle automatically when an
    HTLC arrives. It must be settled separately with the secret preimage.

  Warning: make sure to cancel the created invoice before its CLTV timeout.

  Requires LND built with `invoicesrpc` tag

  Requires `address:write`, `invoices:write` permission

  {
    [cltv_delta]: <Final CLTV Delta Number>
    [description]: <Invoice Description String>
    [description_hash]: <Hashed Description of Payment Hex String>
    [expires_at]: <Expires At ISO 8601 Date String>
    [id]: <Payment Hash Hex String>
    [is_fallback_included]: <Is Fallback Address Included Bool>
    [is_fallback_nested]: <Is Fallback Address Nested Bool>
    [is_including_private_channels]: <Invoice Includes Private Channels Bool>
    lnd: <Authenticated LND API Object>
    [mtokens]: <Millitokens String>
    [routes]: [[{
      [base_fee_mtokens]: <Base Routing Fee In Millitokens String>
      [channel]: <Standard Format Channel Id String>
      [cltv_delta]: <CLTV Blocks Delta Number>
      [fee_rate]: <Fee Rate In Millitokens Per Million Number>
      public_key: <Forward Edge Public Key Hex String>
    }]]
    [tokens]: <Tokens Number>
  }

  @returns via cbk or Promise
  {
    [chain_address]: <Backup Address String>
    created_at: <ISO 8601 Date String>
    description: <Description String>
    id: <Payment Hash Hex String>
    mtokens: <Millitokens Number String>
    request: <BOLT 11 Encoded Payment Request String>
    [secret]: <Hex Encoded Payment Secret String>
    tokens: <Tokens Number>
  }
*/
module.exports = (args, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({method, type, lnd: args.lnd})) {
          return cbk([400, 'ExpectedInvoicesLndToCreateHodlInvoice']);
        }

        if (!!args.routes && !isArray(args.routes)) {
          return cbk([400, 'ExpectedArrayOfHopHintPathsForRoutes']);
        }

        return cbk();
      },

      // Determine the value of the invoice
      mtokens: ['validate', asyncify(({}) => {
        try {
          const mtokens = !args.tokens ? undefined : tokensAsMtok(args.tokens);

          return mtokens || args.mtokens || noTokens.toString();
        } catch (err) {
          throw [400, 'ExpectedIntegerTokensValueForHodlInvoice'];
        }
      })],

      // Add address for the fallback address
      addAddress: ['mtokens', ({}, cbk) => {
        // Exit early when no fallback address is needed
        if (!args.is_fallback_included) {
          return cbk();
        }

        const format = !!args.is_fallback_nested ? 'np2wpkh' : 'p2wpkh';

        return createChainAddress({format, lnd: args.lnd}, cbk);
      }],

      // Determine the route hints
      hints: ['validate', ({}, cbk) => {
        // Exit early when there are no route hints for the invoice
        if (!args.routes) {
          return cbk();
        }

        const hints = args.routes.map(route => {
          return {hop_hints: routeHintFromRoute({route}).hops};
        });

        return cbk(null, hints);
      }],

      // Generate id if needed
      invoiceId: ['validate', ({}, cbk) => {
        if (!!args.id) {
          return cbk(null, {id: args.id});
        }

        const secret = randomBytes(preimageByteLength);

        return cbk(null, {
          id: sha256(secret).toString('hex'),
          secret: secret.toString('hex'),
        });
      }],

      // Add invoice
      addInvoice: [
        'addAddress',
        'hints',
        'invoiceId',
        'mtokens',
        ({addAddress, hints, invoiceId}, cbk) =>
      {
        const fallbackAddress = !addAddress ? undefined : addAddress.address;
        const createdAt = new Date();
        const expireAt = !args.expires_at ? null : parse(args.expires_at);

        const expiryMs = !expireAt ? null : expireAt - createdAt.getTime();

        return args.lnd.invoices.addHoldInvoice({
          cltv_expiry: !args.cltv_delta ? undefined : args.cltv_delta,
          description_hash: hexAsBuffer(args.description_hash),
          expiry: !expiryMs ? undefined : round(expiryMs / msPerSec),
          fallback_addr: fallbackAddress,
          hash: Buffer.from(invoiceId.id, 'hex'),
          memo: args.description,
          private: !!args.is_including_private_channels,
          route_hints: hints || undefined,
          value: args.tokens || undefined,
          value_msat: args.mtokens || undefined,
        },
        (err, response) => {
          if (!!err) {
            return cbk([503, 'UnexpectedAddHodlInvoiceError', {err}]);
          }

          if (!response) {
            return cbk([503, 'ExpectedResponseWhenAddingHodlInvoice']);
          }

          if (!response.payment_request) {
            return cbk([503, 'ExpectedPaymentRequestForCreatedInvoice']);
          }

          return cbk(null, response);
        });
      }],

      // Derive the details of the added invoice
      added: [
        'addInvoice',
        'invoiceId',
        'mtokens',
        asyncify(({addInvoice, invoiceId, mtokens}) =>
      {
        const request = addInvoice.payment_request;

        try {
          parsePaymentRequest({request});
        } catch (err) {
          throw [503, 'ExpectedValidPaymentRequestForHodlInvoice'];
        }

        return {
          mtokens,
          request,
          created_at: parsePaymentRequest({request}).created_at,
          description: args.description || undefined,
          id: invoiceId.id,
          tokens: mtokensAsTokens(mtokens),
        };
      })],

      // Final invoice
      invoice: [
        'addAddress',
        'added',
        'invoiceId',
        ({addAddress, added, invoiceId}, cbk) =>
      {
        return cbk(null, {
          chain_address: !addAddress ? undefined : addAddress.address,
          created_at: added.created_at,
          description: added.description,
          id: invoiceId.id,
          mtokens: added.mtokens,
          request: added.request,
          secret: invoiceId.secret || undefined,
          tokens: added.tokens,
        });
      }],
    },
    returnResult({reject, resolve, of: 'invoice'}, cbk));
  });
};
