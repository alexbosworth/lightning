const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');
const {rpcFailedPolicyAsFail} = require('./../../lnd_responses');

const defaultBaseFee = 1;
const defaultCltvDelta = 40;
const defaultRate = 1;
const feeRatio = 1e6;
const {floor} = Math;
const {isArray} = Array;
const method = 'updateChannelPolicy';
const tokensAsMtokens = tokens => (BigInt(tokens) * BigInt(1e3)).toString();
const type = 'default';

/** Update routing fees on a single channel or on all channels

  Note: not setting a policy attribute will result in a minimal default used

  Setting both `base_fee_tokens` and `base_fee_mtokens` is not supported

  `failures` are not returned on LND 0.13.4 and below

  Requires `offchain:write` permission

  {
    [base_fee_mtokens]: <Base Fee Millitokens Charged String>
    [base_fee_tokens]: <Base Fee Tokens Charged Number>
    [cltv_delta]: <HTLC CLTV Delta Number>
    [fee_rate]: <Fee Rate In Millitokens Per Million Number>
    lnd: <Authenticated LND API Object>
    [max_htlc_mtokens]: <Maximum HTLC Millitokens to Forward String>
    [min_htlc_mtokens]: <Minimum HTLC Millitokens to Forward String>
    [transaction_id]: <Channel Funding Transaction Id String>
    [transaction_vout]: <Channel Funding Transaction Output Index Number>
  }

  @returns via cbk or Promise
  {
    failures: [{
      failure: <Failure Reason String>
      is_pending_channel: <Referenced Channel Is Still Pending Bool>
      is_unknown_channel: <Referenced Channel is Unknown Bool>
      is_invalid_policy: <Policy Arguments Are Invalid Bool>
      transaction_id: <Funding Transaction Id Hex String>
      transaction_vout: <Funding Transaction Output Index Number>
    }]
  }
*/
module.exports = (args, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!!args.base_fee_mtokens && args.base_fee_tokens !== undefined) {
          return cbk([400, 'ExpectedEitherBaseFeeMtokensOrTokensNotBoth']);
        }

        if (!isLnd({method, type, lnd: args.lnd})) {
          return cbk([400, 'ExpectedLndForRoutingFeesUpdate']);
        }

        const isGlobal = !args.transaction_id && !args.transaction_vout;

        if (args.transaction_vout !== undefined && !args.transaction_id) {
          return cbk([400, 'UnexpectedTransactionIdForGlobalFeeUpdate']);
        }

        if (!!args.transaction_id && args.transaction_vout === undefined) {
          return cbk([400, 'UnexpectedTxOutputIndexForGlobalFeeUpdate']);
        }

        return cbk();
      },

      // Determine what base fee rate to use
      baseFeeMillitokens: ['validate', ({}, cbk) => {
        if (!!args.base_fee_mtokens) {
          return cbk(null, args.base_fee_mtokens);
        }

        if (args.base_fee_tokens === undefined) {
          return cbk(null, tokensAsMtokens(defaultBaseFee));
        }

        return cbk(null, tokensAsMtokens(args.base_fee_tokens));
      }],

      // Set the routing fee policy
      updateFees: ['baseFeeMillitokens', ({baseFeeMillitokens}, cbk) => {
        const id = args.transaction_id || undefined;
        const rate = args.fee_rate === undefined ? defaultRate : args.fee_rate;
        const vout = args.transaction_vout;

        const isGlobal = !args.transaction_id && vout === undefined;

        const chan = {
          funding_txid_str: id,
          output_index: vout === undefined ? undefined : vout,
        };

        return args.lnd[type][method]({
          base_fee_msat: baseFeeMillitokens,
          chan_point: !isGlobal ? chan : undefined,
          fee_rate: rate / feeRatio,
          global: isGlobal || undefined,
          max_htlc_msat: args.max_htlc_mtokens || undefined,
          min_htlc_msat: args.min_htlc_mtokens || undefined,
          min_htlc_msat_specified: !!args.min_htlc_mtokens,
          time_lock_delta: args.cltv_delta || defaultCltvDelta,
        },
        (err, res) => {
          if (!!err) {
            return cbk([503, 'UnexpectedErrorUpdatingRoutingFees', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedRoutingPolicyUpdateResponse']);
          }

          if (!isArray(res.failed_updates)) {
            return cbk([503, 'ExpectedFailedUpdateArrayInUpdateResponse']);
          }

          try {
            const failures = res.failed_updates.map(rpcFailedPolicyAsFail);

            return cbk(null, {failures});
          } catch (err) {
            return cbk([503, err.message]);
          }
        });
      }],
    },
    returnResult({reject, resolve, of: 'updateFees'}, cbk));
  });
};
