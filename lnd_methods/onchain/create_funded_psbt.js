const asyncAuto = require('async/auto');
const {componentsOfTransaction} = require('@alexbosworth/blockchain');
const {createPsbt} = require('psbt');
const {extendPsbt} = require('psbt');
const {returnResult} = require('asyncjs-util');
const {unsignedTxFromPsbt} = require('@alexbosworth/blockchain');

const {isLnd} = require('./../../lnd_requests');

const asOutpoint = n => `${n.transaction_id}:${n.transaction_vout}`;
const asSecs = date => (Date.parse(date) - Date.now()) / 1e3;
const asUtxo = n => !n ? n : {script_pub: n.output_script, tokens: n.tokens};
const bufferAsHex = buffer => buffer.toString('hex');
const {ceil} = Math;
const defaultChangeType = 'CHANGE_ADDRESS_TYPE_P2TR';
const defaultConfirmationTarget = 6;
const errorUnsupported = 'transaction template missing, need to specify either PSBT or raw TX template';
const expirationAsDate = epoch => new Date(Number(epoch) * 1e3).toISOString();
const hasInputInfo = n => !!n.bip32_derivations || !!n.witness_utxo;
const hexAsBuffer = hex => Buffer.from(hex, 'hex');
const indexNotFound = -1;
const {isArray} = Array;
const {isBuffer} = Buffer;
const isFractional = n => Number.isFinite(n) && !Number.isInteger(n);
const isKnownChangeFormat = format => !format || format === 'p2tr';
const isLockExpiry = n => n === undefined || Date.parse(n) - Date.now() >= 1e3;
const isLockId = n => n === undefined || /^[0-9A-F]{64}$/i.test(n);
const isMaxFeeRatio = n => n === undefined || (Number.isFinite(n) && n > 0);
const isTaproot = script => /^5120[0-9a-f]{64}$/i.test(script);
const method = 'fundPsbt';
const sighashAll = 1;
const strategy = type => !type ? undefined : `STRATEGY_${type.toUpperCase()}`;
const txIdFromBuffer = buffer => buffer.slice().reverse().toString('hex');
const type = 'wallet';
const unconfirmedConfirmationsCount = 0;
const vbytesPerKw = 250;

/** Create an unsigned funded PSBT given inputs or outputs

  When specifying local inputs, they must be locked before using

  `lock_id` and `lock_expires_at` set the id and expiration of the locks on
  the inputs that are added to fund the PSBT

  LND 0.21.4 and below need inputs from other wallets to have a
  `witness_utxo`, and P2TR ones to also have a `bip32_derivations` entry for
  their x-only internal key, without `leaf_hashes`

  LND 0.21.4 and below can only estimate the size of P2WPKH, nested P2WPKH
  and P2TR key spend inputs

  Inputs with a `witness_utxo` that are not P2TR are set to sign with
  SIGHASH_ALL, since LND 0.21.4 and below otherwise sign them with an invalid
  sighash type

  A fractional `fee_tokens_per_vbyte` is rounded up to whole tokens per 1000
  weight units

  `max_fee_ratio` is the highest fee to total output value ratio to allow.
  LND 0.21.4 and below use 0.2 when it is not set, and allow at most 1

  `change_format` options: `p2tr` (only one change type is supported)

  `utxo_selection` methods: 'largest', 'random'

  Requires `onchain:write` permission

  Requires LND built with `walletrpc` tag

  This method is not supported on LND 0.17.5 or below

  `lock_expires_at`, `lock_id`, `max_fee_ratio` and a fractional
  `fee_tokens_per_vbyte` are not supported on LND 0.18.5 or below

  {
    [change_format]: <Change Address Address Format String>
    [fee_tokens_per_vbyte]: <Chain Fee Tokens Per Virtual Byte Number>
    [inputs]: [{
      [bip32_derivations]: [{
        fingerprint: <Public Key Fingerprint Hex String>
        [leaf_hashes]: [<Taproot Leaf Hash Hex String>]
        [path]: <BIP 32 Derivation Path String>
        public_key: <Public Key Hex String>
      }]
      [sequence]: <Sequence Number>
      transaction_id: <Unspent Transaction Id Hex String>
      transaction_vout: <Unspent Transaction Output Index Number>
      [witness_utxo]: {
        output_script: <UTXO Output Script Hex String>
        tokens: <UTXO Tokens Number>
      }
    }]
    lnd: <Authenticated LND API Object>
    [lock_expires_at]: <Lock Expires At ISO 8601 Date String>
    [lock_id]: <Lock Identifier Hex String>
    [max_fee_ratio]: <Maximum Fee To Total Output Value Ratio Number>
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
    inputs: [{
      [lock_expires_at]: <UTXO Lock Expires At ISO 8601 Date String>
      [lock_id]: <UTXO Lock Id Hex String>
      transaction_id: <Unspent Transaction Id Hex String>
      transaction_vout: <Unspent Transaction Output Index Number>
    }]
    outputs: [{
      is_change: <Is Change Output Bool>
      output_script: <Output Script Hex String>
      tokens: <Send Tokens Tokens Number>
    }]
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

        if (!isLockExpiry(args.lock_expires_at)) {
          return cbk([400, 'ExpectedLaterLockExpiresAtToCreateFundedPsbt']);
        }

        if (!isLockId(args.lock_id)) {
          return cbk([400, 'ExpectedHexLockIdOf32BytesToCreateFundedPsbt']);
        }

        if (!isMaxFeeRatio(args.max_fee_ratio)) {
          return cbk([400, 'ExpectedPositiveMaxFeeRatioToCreateFundedPsbt']);
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
        // Exit early with a per kw fee rate when the rate is fractional
        if (isFractional(args.fee_tokens_per_vbyte)) {
          const tokensPerKw = ceil(args.fee_tokens_per_vbyte * vbytesPerKw);

          return cbk(null, {fee_tokens_per_kw: tokensPerKw});
        }

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
        try {
          const {psbt} = createPsbt({
            outputs: args.outputs || [],
            timelock: args.timelock,
            utxos: (args.inputs || []).map(input => ({
              id: input.transaction_id,
              sequence: input.sequence,
              vout: input.transaction_vout,
            })),
            version: args.version,
          });

          // Exit early when there is no UTXO or key info to add to inputs
          if (!(args.inputs || []).find(hasInputInfo)) {
            return cbk(null, hexAsBuffer(psbt));
          }

          // LND 0.21.4 and below need UTXO info for inputs from other wallets
          const extended = extendPsbt({
            psbt,
            inputs: args.inputs.map(input => {
              const utxo = input.witness_utxo;

              // LND 0.21.4 and below sign v0 inputs without a type as type 0
              const isV0 = !!utxo && !isTaproot(utxo.output_script);

              return {
                bip32_derivations: input.bip32_derivations,
                sighash_type: isV0 ? sighashAll : undefined,
                witness_utxo: asUtxo(utxo),
              };
            }),
          });

          return cbk(null, hexAsBuffer(extended.psbt));
        } catch (err) {
          return cbk([400, 'FailedToCreatePsbtToFund', {err: err.message}]);
        }
      }],

      // Determine the lock to use for the inputs added to fund the PSBT
      lock: ['validate', ({}, cbk) => {
        const expiresAt = args.lock_expires_at;

        return cbk(null, {
          id: !!args.lock_id ? hexAsBuffer(args.lock_id) : undefined,
          seconds: !!expiresAt ? ceil(asSecs(expiresAt)) : undefined,
        });
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
        'lock',
        'minConfs',
        ({change, fee, funding, lock, minConfs}, cbk) =>
      {
        return args.lnd[type][method]({
          change_type: defaultChangeType,
          coin_select: {
            add: change.add,
            psbt: funding,
            existing_output_index: change.existing_output_index,
          },
          coin_selection_strategy: strategy(args.utxo_selection),
          custom_lock_id: lock.id,
          lock_expiration_seconds: lock.seconds,
          max_fee_ratio: args.max_fee_ratio,
          min_confs: minConfs,
          sat_per_kw: fee.fee_tokens_per_kw,
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

          if (res.change_output_index === undefined) {
            return cbk([503, 'ExpectedChangeIndexWhenCreatingFundedPsbt']);
          }

          if (!isArray(res.locked_utxos)) {
            return cbk([503, 'ExpectedArrayOfLocksWhenCreatingFundedPsbt']);
          }

          if (!!res.locked_utxos.filter(n => !n).length) {
            return cbk([503, 'ExpectedNonEmptyLocksWhenCreatingFundedPsbt']);
          }

          if (!!res.locked_utxos.find(n => !n.outpoint)) {
            return cbk([503, 'ExpectedLockOutpointWhenCreatingFundedPsbt']);
          }

          return cbk(null, {
            change_output_index: res.change_output_index,
            locked_utxos: res.locked_utxos,
            psbt: bufferAsHex(res.funded_psbt),
          });
        });
      }],

      // Derive the raw transaction from the funded PSBT
      tx: ['fund', ({fund}, cbk) => {
        const {psbt} = fund;

        try {
          const tx = bufferAsHex(unsignedTxFromPsbt({psbt}).transaction);

          const {inputs, outputs} = componentsOfTransaction({transaction: tx});

          return cbk(null, {inputs, outputs});
        } catch (err) {
          return cbk([503, 'FailedToDecodeFundedPsbt', {err: err.message}]);
        }
      }],

      // Derive the final funding inputs for the transaction
      fundingInputs: ['fund', 'tx', ({fund, tx}, cbk) => {
        // Locks are reservations on inputs to prevent double-spending
        const locks = fund.locked_utxos.map(utxo => ({
          expires_at: expirationAsDate(utxo.expiration),
          id: bufferAsHex(utxo.id),
          transaction_id: txIdFromBuffer(utxo.outpoint.txid_bytes),
          transaction_vout: utxo.outpoint.output_index,
        }));

        // The funding inputs are encoded in the PSBT's unsigned tx
        const funding = tx.inputs.map(({id, vout}) => ({
          transaction_id: id,
          transaction_vout: vout,
        }));

        // Include relevant UTXO locks with inputs
        const inputs = funding.map(input => {
          const lock = locks.find(n => asOutpoint(n) === asOutpoint(input));

          return {
            lock_expires_at: !!lock ? lock.expires_at : undefined,
            lock_id: !!lock ? lock.id : undefined,
            transaction_id: input.transaction_id,
            transaction_vout: input.transaction_vout,
          };
        });

        return cbk(null, inputs);
      }],

      // Final funded PSBT
      funded: [
        'fund',
        'fundingInputs',
        'tx',
        ({fund, fundingInputs, tx}, cbk) =>
      {
        return cbk(null, {
          inputs: fundingInputs,
          outputs: tx.outputs.map(({script, tokens}, index) => ({
            tokens,
            is_change: index === fund.change_output_index,
            output_script: script,
          })),
          psbt: fund.psbt,
        });
      }],
    },
    returnResult({reject, resolve, of: 'funded'}, cbk));
  });
};
