const asyncAuto = require('async/auto');
const {createPsbt} = require('psbt');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const bufferAsHex = buffer => buffer.toString('hex');
const defaultChangeType = () => 'CHANGE_ADDRESS_TYPE_P2TR';
const defaultConfirmationTarget = 6;
const errorUnsupported = 'transaction template missing, need to specify either PSBT or raw TX template';
const hexAsBuffer = hex => Buffer.from(hex, 'hex');
const indexNotFound = -1;
const {isBuffer} = Buffer;
const isKnownChangeFormat = format => !format || format === 'p2tr';
const method = 'fundPsbt';
const strategy = type => !type ? undefined : `STRATEGY_${type.toUpperCase()}`;
const type = 'wallet';
const unconfirmedConfirmationsCount = 0;

/** Create an unsigned funded PSBT given inputs or outputs

  When specifying local inputs, they must be locked before using

  `change_format` options: `p2tr` (only one change type is supported)

  `utxo_selection` methods: 'largest', 'random'

  Requires `onchain:write` permission

  Requires LND built with `walletrpc` tag

  This method is not supported on LND 0.17.5 or below

  {
    [change_format]: <Change Address Address Format String>
    [fee_tokens_per_vbyte]: <Chain Fee Tokens Per Virtual Byte Number>
    [inputs]: [{
      [sequence]: <Sequence Number>
      transaction_id: <Unspent Transaction Id Hex String>
      transaction_vout: <Unspent Transaction Output Index Number>
    }]
    lnd: <Authenticated LND API Object>
    [min_confirmations]: <Select Inputs With Minimum Confirmations Number>
    [outputs]: [{
      [is_change]: <Use This Output For Change Bool>
      script: <Output Script Hex String>
      tokens: <Send Tokens Tokens Number>
    }]
    [target_confirmations]: <Blocks To Wait for Confirmation Number>
    [timelock]: <Spendable Lock Time on Transaction Number>
    [utxo_selection]: <Select Inputs Using Selection Methodology Type String>
    [version]: <Transaction Version Number>
  }

  @returns via cbk or Promise
  {
    psbt: <Unsigned PSBT Hex String>
  }
*/
module.exports = (args, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isKnownChangeFormat(args.change_format)) {
          return cbk([400, 'ExpectedKnownChangeFormatToFundPsbt']);
        }

        if (!isLnd({method, type, lnd: args.lnd})) {
          return cbk([400, 'ExpectedAuthenticatedLndToCreateFundedPsbt']);
        }

        return cbk();
      },

      // Determine the change type
      change: ['validate', ({}, cbk) => {
        const changeIndex = (args.outputs || []).findIndex(n => !!n.is_change);

        // Exit early when there is no change defined
        if (changeIndex !== indexNotFound) {
          return cbk(null, {existing_output_index: changeIndex});
        }

        // When there is no change output specified, add a change output
        return cbk(null, {add: true});
      }],

      // Determine the fee setting for the funded PSBT
      fee: ['validate', ({}, cbk) => {
        // Exit early when the fee is directly specified
        if (!!args.fee_tokens_per_vbyte) {
          return cbk(null, {fee_tokens_per_vbyte: args.fee_tokens_per_vbyte});
        }

        // Exit early when the confirmation target is directly specified
        if (!!args.target_confirmations) {
          return cbk(null, {target_confirmations: args.target_confirmations});
        }

        // Use the default confirmations target when there's no preference
        return cbk(null, {target_confirmations: defaultConfirmationTarget});
      }],

      // Construct the PSBT that is needed for coin select type funding
      funding: ['validate', ({}, cbk) => {
        const {psbt} = createPsbt({
          change_type: defaultChangeType(args.change_type),
          outputs: args.outputs || [],
          timelock: args.timelock,
          utxos: (args.inputs || []).map(input => ({
            id: input.transaction_id,
            sequence: input.sequence,
            vout: input.transaction_vout,
          })),
          version: args.version,
        });

        return cbk(null, hexAsBuffer(psbt));
      }],

      // Determine the minimum confirmations for UTXOs to select
      minConfs: ['validate', ({}, cbk) => {
        // Exit early when using unconfirmed UTXOs is explicitly specified
        if (args.min_confirmations === unconfirmedConfirmationsCount) {
          return cbk(null, unconfirmedConfirmationsCount);
        }

        return cbk(null, args.min_confirmations || undefined);
      }],

      // Create the funded PSBT using the coin select strategy
      fund: [
        'change',
        'fee',
        'funding',
        'minConfs',
        ({change, fee, funding, minConfs}, cbk) =>
      {
        return args.lnd[type][method]({
          change_type: defaultChangeType,
          coin_select: {
            add: change.add,
            psbt: funding,
            existing_output_index: change.existing_output_index,
          },
          coin_selection_strategy: strategy(args.utxo_selection),
          min_confs: minConfs,
          sat_per_vbyte: fee.fee_tokens_per_vbyte,
          spend_unconfirmed: minConfs === unconfirmedConfirmationsCount,
          target_conf: fee.target_confirmations,
        },
        (err, res) => {
          if (!!err && err.details === errorUnsupported) {
            return cbk([501, 'CreateFundedPsbtMethodNotSupported']);
          }

          if (!!err) {
            return cbk([503, 'UnexpectedErrorCreatingFundedPsbt', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedResultWhenCreatingFundedPsbt']);
          }

          if (!isBuffer(res.funded_psbt)) {
            return cbk([503, 'ExpectedFundedTransactionPsbtToBeCreated']);
          }

          return cbk(null, {psbt: bufferAsHex(res.funded_psbt)});
        });
      }],
    },
    returnResult({reject, resolve, of: 'fund'}, cbk));
  });
};
