const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');
const {Transaction} = require('bitcoinjs-lib');

const {isLnd} = require('./../../lnd_requests');

const bufferAsHex = buffer => buffer.toString('hex');
const {fromBuffer} = Transaction;
const hexAsBuffer = hex => Buffer.from(hex, 'hex');
const initialConfirmationCount = 0;
const {isArray} = Array;
const {isBuffer} = Buffer;
const method = 'sendOutputs';
const minFeeRate = 1;
const unconfirmedConfCount = 0;
const type = 'wallet';
const weightPerKWeight = 1e3;
const weightPerVByte = 4;

/** Send on-chain funds to multiple output scripts

  Requires `onchain:write` permission

  Requires LND compiled with `walletrpc` build tag

  {
    [description]: <Transaction Label String>
    [fee_tokens_per_vbyte]: <Chain Fee Tokens Per Virtual Byte Number>
    lnd: <Authenticated LND API Object>
    send_to: [{
      script: <output Script Hex String>
      tokens: <Tokens Number>
    }]
    [utxo_confirmations]: <Minimum Confirmations for UTXO Selection Number>
  }

  @returns via cbk or Promise
  {
    confirmation_count: <Total Confirmations Number>
    id: <Transaction Id Hex String>
    is_confirmed: <Transaction Is Confirmed Bool>
    is_outgoing: <Transaction Is Outgoing Bool>
    tokens: <Transaction Tokens Number>
    transaction: <Raw Transaction Hex String>
  }
*/
module.exports = (args, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({method, type, lnd: args.lnd})) {
          return cbk([400, 'ExpectedLndToSendToChainOutputScripts']);
        }

        if (!isArray(args.send_to) || !args.send_to.length) {
          return cbk([400, 'ExpectedSendToOutputScriptsAndTokens']);
        }

        return cbk();
      },

      send: ['validate', ({}, cbk) => {
        const feePerVByte = args.fee_tokens_per_vbyte || minFeeRate;

        const feePerKw = feePerVByte * weightPerKWeight / weightPerVByte;

        return args.lnd[type][method]({
          label: args.description || undefined,
          min_confs: args.utxo_confirmations || undefined,
          outputs: args.send_to.map(output => ({
            pk_script: hexAsBuffer(output.script),
            value: output.tokens.toString(),
          })),
          sat_per_kw: feePerKw,
          spend_unconfirmed: args.utxo_confirmations === unconfirmedConfCount,
        },
        (err, res) => {
          if (!!err) {
            return cbk([500, 'UnexpectedSendToChainOutputScriptsErr', {err}]);
          }

          if (!res) {
            return cbk([500, 'ExpectedResponseForSendToChainOutputsRequest']);
          }

          try {
            fromBuffer(res.raw_tx).getId();
          } catch (err) {
            return cbk([500, 'ExpectedRawTransactionInSendToOutputsResponse']);
          }

          const row = {
            confirmation_count: initialConfirmationCount,
            id: fromBuffer(res.raw_tx).getId(),
            is_confirmed: false,
            is_outgoing: true,
            tokens: args.send_to.reduce((sum, n) => sum + n.tokens, Number()),
            transaction: bufferAsHex(res.raw_tx),
          };

          return cbk(null, row);
        });
      }],
    },
    returnResult({reject, resolve, of: 'send'}, cbk));
  });
};
