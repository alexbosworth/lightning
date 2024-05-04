const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const defaultConfTarget = 6;
const hasNumber = n => !!n && n !== '0';
const {isArray} = Array;
const method = 'estimateFee';
const notFound = -1;
const strategy = type => !type ? undefined : `STRATEGY_${type.toUpperCase()}`;
const type = 'default';
const unconfirmedConfCount = 0;

/** Get a chain fee estimate for a prospective chain send

  `utxo_selection` methods: 'largest', 'random'

  Requires `onchain:read` permission

  Specifying 0 for `utxo_confirmations` is not supported in LND 0.13.0 or below

  `utxo_selection` is not supported in LND 0.17.5 and below

  {
    lnd: <Authenticated LND API Object>
    send_to: [{
      address: <Address String>
      tokens: <Tokens Number>
    }]
    [target_confirmations]: <Target Confirmations Number>
    [utxo_confirmations]: <Minimum Confirmations for UTXO Selection Number>
    [utxo_selection]: <Select UTXOs Using Method String>
  }

  @returns via cbk or Promise
  {
    fee: <Total Fee Tokens Number>
    tokens_per_vbyte: <Fee Tokens Per VByte Number>
  }
*/
module.exports = (args, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({method, type, lnd: args.lnd})) {
          return cbk([400, 'ExpectedLndToEstimateChainFee']);
        }

        if (!isArray(args.send_to) || !args.send_to.length) {
          return cbk([400, 'ExpectedSendToAddressesToEstimateChainFee']);
        }

        // Confirm send_to array has addresses
        if (args.send_to.findIndex(({address}) => !address) !== notFound) {
          return cbk([400, 'ExpectedSendToAddressInEstimateChainFee']);
        }

        // Confirm send_to array has tokens
        if (args.send_to.findIndex(({tokens}) => !tokens) !== notFound) {
          return cbk([400, 'ExpectedSendToTokensInEstimateChainFee']);
        }

        return cbk();
      },

      // Get fee estimate
      getEstimate: ['validate', ({}, cbk) => {
        const AddrToAmount = {};

        args.send_to.forEach(({address, tokens}) => {
          return AddrToAmount[address] = tokens;
        });

        return args.lnd[type][method]({
          AddrToAmount,
          coin_selection_strategy: strategy(args.utxo_selection),
          target_conf: args.target_confirmations || defaultConfTarget,
          min_confs: args.utxo_confirmations || undefined,
          spend_unconfirmed: args.utxo_confirmations === unconfirmedConfCount,
        },
        (err, res) => {
          if (!!err) {
            return cbk([503, 'UnexpectedErrEstimatingFeeForChainSend', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedResponseFromEstimateFeeApi']);
          }

          if (!res.fee_sat) {
            return cbk([503, 'ExpectedChainFeeInResponseToChainFeeEstimate']);
          }

          return cbk(null, {
            fee: Number(res.fee_sat),
            tokens_per_vbyte: Number(res.sat_per_vbyte),
          });
        });
      }],
    },
    returnResult({reject, resolve, of: 'getEstimate'}, cbk));
  });
};
