const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');
const {rpcUtxoAsUtxo} = require('./../../lnd_responses');

const {isArray} = Array;
const maxConfs = 0x7FFFFFFF;
const method = 'listUnspent';
const type = 'default';

/** Get unspent transaction outputs

  Requires `onchain:read` permission

  {
    lnd: <Authenticated LND API Object>
    [max_confirmations]: <Maximum Confirmations Number>
    [min_confirmations]: <Minimum Confirmations Number>
  }

  @returns via cbk or Promise
  {
    utxos: [{
      address: <Chain Address String>
      address_format: <Chain Address Format String>
      confirmation_count: <Confirmation Count Number>
      output_script: <Output Script Hex String>
      tokens: <Unspent Tokens Number>
      transaction_id: <Transaction Id Hex String>
      transaction_vout: <Transaction Output Index Number>
    }]
  }
*/
module.exports = (args, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({method, type, lnd: args.lnd})) {
          return cbk([400, 'ExpectedLndToGetUtxos']);
        }

        return cbk();
      },

      // Get UTXOs from wallet kit
      getWalletUtxos: ['validate', ({}, cbk) => {
        return args.lnd.wallet[method]({
          max_confs: args.max_confirmations || maxConfs,
          min_confs: args.min_confirmations || Number(),
        },
        (err, res) => {
          // Ignore errors and fail back to legacy method
          if (!!err) {
            return cbk();
          }

          return cbk(null, res);
        });
      }],

      // Get UTXOs from the legacy API - LND without the walletrpc build tag
      getLegacyUtxos: ['getWalletUtxos', ({getWalletUtxos}, cbk) => {
        if (!!getWalletUtxos) {
          return cbk();
        }

        return args.lnd.default[method]({
          max_confs: args.max_confirmations || maxConfs,
          min_confs: args.min_confirmations || Number(),
        },
        (err, res) => {
          if (!!err) {
            return cbk([503, 'UnexpectedErrorGettingUnspentTxOutputs', {err}]);
          }

          return cbk(null, res);
        });
      }],

      // Final utxos
      utxos: [
        'getLegacyUtxos',
        'getWalletUtxos',
        ({getLegacyUtxos, getWalletUtxos}, cbk) =>
      {
        const res = getWalletUtxos || getLegacyUtxos;

        if (!res) {
          return cbk([503, 'ExpectedResponseForListUnspentRequest']);
        }

        if (!isArray(res.utxos)) {
          return cbk([503, 'ExpectedUtxosInListUnspentsResponse']);
        }

        try {
          const utxos = res.utxos.map(utxo => rpcUtxoAsUtxo(utxo));

          return cbk(null, {utxos});
        } catch (err) {
          return cbk([503, err.message]);
        }
      }],
    },
    returnResult({reject, resolve, of: 'utxos'}, cbk));
  });
};
