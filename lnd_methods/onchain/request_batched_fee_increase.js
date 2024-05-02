const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {getHeight} = require('./../generic');
const {isLnd} = require('./../../lnd_requests');

const defaultTargetConfirmations = 1008;
const isHash = n => /^[0-9A-F]{64}$/i.test(n);
const isNumber = n => !isNaN(n);
const messageExternalUtxo = 'the passed output does not belong to the wallet';
const method = 'bumpFee';
const positive = number => number > 0 ? number : 1;
const type = 'wallet';

/** Request batched CPFP fee bumping of an unconfirmed outpoint on a deadline

  Requires `onchain:write` permission

  Requires LND built with `walletrpc` build tag

  This method is unsupported on LND 0.17.5 and below

  {
    lnd: <Authenticated LND API Object>
    [max_fee]: <Maximum Tokens to Pay Into Chain Fees Number>
    [max_height]: <Maximum Height To Reach a Confirmation Number>
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

      // Get the current height to adjust max height to a conf target delta
      getHeight: ['validate', ({}, cbk) => {
        // Exit early when there is no max height specified
        if (!args.max_height) {
          return cbk();
        }

        return getHeight({lnd: args.lnd}, cbk);
      }],

      // Determine the confirmation target
      targetConf: ['getHeight', ({getHeight}, cbk) => {
        // Exit early when there is no max height
        if (!getHeight) {
          return cbk(null, defaultTargetConfirmations);
        }

        const currentBlockHeight = getHeight.current_block_height;

        return cbk(null, positive(args.max_height - currentBlockHeight));
      }],

      // Make the request to submit the input to the batch sweeper
      request: ['targetConf', ({targetConf}, cbk) => {
        return args.lnd[type][method]({
          budget: args.max_fee,
          outpoint: {
            output_index: args.transaction_vout,
            txid_str: args.transaction_id,
          },
          target_conf: targetConf,
        },
        (err, res) => {
          if (!!err && err.details === messageExternalUtxo) {
            return cbk([404, 'SpecifiedUtxoNotFoundInWalletUtxos']);
          }

          if (!!err) {
            return cbk([503, 'UnexpectedErrorRequestingBatchIncrease', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedResponseToBatchedFeeIncreaseRequest']);
          }

          if (res.status === undefined) {
            return cbk([503, 'ExpectedStatusOfBatchedFeeIncrease']);
          }

          return cbk();
        });
      }],
    },
    returnResult({reject, resolve}, cbk));
  });
};
