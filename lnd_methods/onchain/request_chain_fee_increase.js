const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const defaultConfirmations = 6;
const isHash = n => /^[0-9A-F]{64}$/i.test(n);
const isNumber = n => !isNaN(n);
const method = 'bumpFee';
const type = 'wallet';

/** Request a future on-chain CPFP fee increase for an unconfirmed UTXO

  Requires `onchain:write` permission

  Requires LND built with `walletrpc` build tag

  {
    [fee_tokens_per_vbyte]: <Chain Fee Tokens Per Virtual Byte Number>
    lnd: <Authenticated LND API Object>
    [target_confirmations]: <Confirmations To Wait Number>
    transaction_id: <Unconfirmed UTXO Transaction Id Hex String>
    transaction_vout: <Unconfirmed UTXO Transaction Index Number>
  }

  @returns via cbk or Promise
*/
module.exports = (args, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!!args.fee_tokens_per_vbyte && !!args.target_confirmations) {
          return cbk([400, 'ExpectedEitherFeeRateOrTargetNotBothToBumpFee']);
        }

        if (!isLnd({method, type, lnd: args.lnd})) {
          return cbk([400, 'ExpectedLndToRequestChainFeeIncrease']);
        }

        if (!isHash(args.transaction_id)) {
          return cbk([400, 'ExpectedTransactionIdToRequestChainFeeIncrease']);
        }

        if (!isNumber(args.transaction_vout)) {
          return cbk([400, 'ExpectedTransactionOutputIndexToRequestFeeBump']);
        }

        return cbk();
      },

      // Determine the fee rate
      feeRate: ['validate', ({}, cbk) => {
        // Exit early when the fee rate is specified
        if (!!args.fee_tokens_per_vbyte) {
          return cbk(null, {sat_per_byte: args.fee_tokens_per_vbyte});
        }

        // Exit early when the confirmation target is specified
        if (!!args.target_confirmations) {
          return cbk(null, {target_conf: args.target_confirmations});
        }

        return cbk(null, {target_conf: defaultConfirmations});
      }],

      // Make the request to increase the chain fee
      request: ['feeRate', ({feeRate}, cbk) => {
        return args.lnd[type][method]({
          force: true,
          outpoint: {
            output_index: args.transaction_vout,
            txid_str: args.transaction_id,
          },
          sat_per_byte: feeRate.sat_per_byte,
          target_conf: feeRate.target_conf,
        },
        (err, res) => {
          if (!!err) {
            return cbk([500, 'UnexpectedErrorRequestingChainFeeBump', {err}]);
          }

          return cbk();
        });
      }],
    },
    returnResult({reject, resolve, of: 'request'}, cbk));
  });
};
