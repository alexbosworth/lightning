const asyncAuto = require('async/auto');
const {decodePsbt} = require('psbt');
const {returnResult} = require('asyncjs-util');
const tinysecp = require('tiny-secp256k1');
const {Transaction} = require('bitcoinjs-lib');

const {isLnd} = require('./../../lnd_requests');

const asOutpoint = n => `${n.transaction_id}:${n.transaction_vout}`;
const defaultConfirmationTarget = 6;
const expirationAsDate = epoch => new Date(Number(epoch) * 1e3).toISOString();
const {fromHex} = Transaction;
const hexFromBuffer = buffer => buffer.toString('hex');
const {isArray} = Array;
const {isBuffer} = Buffer;
const method = 'fundPsbt';
const notSupported = /unknown.*walletrpc.WalletKit/;
const type = 'wallet';
const txIdFromBuffer = buffer => buffer.slice().reverse().toString('hex');
const txIdFromHash = hash => hash.reverse().toString('hex');

/** Lock and optionally select inputs to a partially signed transaction

  Specify outputs or PSBT with the outputs encoded

  If there are no inputs passed, internal UTXOs will be selected and locked

  Requires `onchain:write` permission

  Requires LND built with `walletrpc` tag

  This method is not supported in LND 0.11.1 and below

  Specifying 0 for `min_confirmations` is not supported in LND 0.13.0 and below

  {
    [fee_tokens_per_vbyte]: <Chain Fee Tokens Per Virtual Byte Number>
    [inputs]: [{
      transaction_id: <Unspent Transaction Id Hex String>
      transaction_vout: <Unspent Transaction Output Index Number>
    }]
    lnd: <Authenticated LND API Object>
    [min_confirmations]: <Spend UTXOs With Minimum Confirmations Number>
    [outputs]: [{
      address: <Chain Address String>
      tokens: <Send Tokens Tokens Number>
    }]
    [target_confirmations]: <Confirmations To Wait Number>
    [psbt]: <Existing PSBT Hex String>
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
      is_change: <Spends To a Generated Change Output Bool>
      output_script: <Output Script Hex String>
      tokens: <Send Tokens Tokens Number>
    }]
    psbt: <Unsigned PSBT Hex String>
  }
*/
module.exports = (args, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Import ECPair library
      ecp: async () => (await import('ecpair')).ECPairFactory(tinysecp),

      // Check arguments
      validate: cbk => {
        if (!isLnd({method, type, lnd: args.lnd})) {
          return cbk([400, 'ExpectedAuthenticatedLndToFundPsbt']);
        }

        if (!args.outputs && !args.psbt) {
          return cbk([400, 'ExpectedEitherOutputsOrPsbtToFundPsbt']);
        }

        if (!!args.outputs && !isArray(args.outputs)) {
          return cbk([400, 'ExpectedArrayOfOutputsToFundPsbt']);
        }

        if (!!args.outputs && !!args.psbt) {
          return cbk([400, 'ExpectedOnlyOutputsOrPsbtToFundPsbt']);
        }

        return cbk();
      },

      // Fee setting for the funded PSBT
      fee: ['validate', ({}, cbk) => {
        if (!!args.fee_tokens_per_vbyte) {
          return cbk(null, {fee_tokens_per_vbyte: args.fee_tokens_per_vbyte});
        }

        if (!!args.target_confirmations) {
          return cbk(null, {target_confirmations: args.target_confirmations});
        }

        return cbk(null, {target_confirmations: defaultConfirmationTarget});
      }],

      // Raw inputs to send to
      inputs: ['validate', ({}, cbk) => {
        if (!args.inputs) {
          return cbk(null, []);
        }

        const inputs = args.inputs.map(input => ({
          output_index: input.transaction_vout,
          txid_bytes: Buffer.from(input.transaction_id, 'hex').reverse(),
        }));

        return cbk(null, inputs);
      }],

      // Minimum confirmations for UTXOs to select
      minConfs: ['validate', ({}, cbk) => {
        if (args.min_confirmations === Number()) {
          return cbk(null, args.min_confirmations);
        }

        return cbk(null, args.min_confirmations || undefined);
      }],

      // Raw outputs to send to
      outputs: ['validate', ({}, cbk) => {
        if (!args.outputs) {
          return cbk();
        }

        const outputs = args.outputs.reduce((sum, n) => {
          sum[n.address] = n.tokens.toString();

          return sum;
        },
        {});

        return cbk(null, outputs);
      }],

      // Raw funding details
      funding: ['inputs', 'outputs', ({inputs, outputs}, cbk) => {
        if (!outputs) {
          return cbk();
        }

        return cbk(null, {inputs, outputs});
      }],

      // Fund the PSBT
      fund: ['fee', 'funding', 'minConfs', ({fee, funding, minConfs}, cbk) => {
        return args.lnd[type][method]({
          min_confs: minConfs !== undefined ? minConfs : undefined,
          psbt: !!args.psbt ? Buffer.from(args.psbt, 'hex') : undefined,
          raw: funding || undefined,
          sat_per_vbyte: fee.fee_tokens_per_vbyte || undefined,
          spend_unconfirmed: minConfs === Number() || undefined,
          target_conf: fee.target_confirmations || undefined,
        },
        (err, res) => {
          if (!!err && notSupported.test(err.details)) {
            return cbk([501, 'FundPsbtMethodNotSupported']);
          }

          if (!!err) {
            return cbk([503, 'UnexpectedErrorFundingTransaction', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedResultOfTransactionFunding']);
          }

          if (res.change_output_index === undefined) {
            return cbk([503, 'ExpectedFundingChangeOutputIndexNumber']);
          }

          if (!isBuffer(res.funded_psbt)) {
            return cbk([503, 'ExpectedFundedTransactionPsbt']);
          }

          if (!isArray(res.locked_utxos)) {
            return cbk([503, 'ExpectedArrayOfUtxoLocksForFundedTransaction']);
          }

          if (!!res.locked_utxos.filter(n => !n).length) {
            return cbk([503, 'ExpectedNonEmptyLockedUtxosForFundedPsbt']);
          }

          if (!!res.locked_utxos.find(n => !n.outpoint)) {
            return cbk([503, 'ExpectedOutpointInLockedUtxosForFundedPsbt']);
          }

          return cbk(null, {
            change_output_index: res.change_output_index,
            locked_utxos: res.locked_utxos,
            psbt: hexFromBuffer(res.funded_psbt),
          });
        });
      }],

      // Derive the raw transaction from the funded PSBT
      tx: ['ecp', 'fund', ({ecp, fund}, cbk) => {
        const {psbt} = fund;

        try {
          const tx = fromHex(decodePsbt({ecp, psbt}).unsigned_transaction);

          return cbk(null, tx);
        } catch (err) {
          return cbk([503, 'FailedToDecodePsbtInFundPsbtResponse', {err}]);
        }
      }],

      // Derive the final funding inputs for the transaction
      fundingInputs: ['fund', 'tx', ({fund, tx}, cbk) => {
        // Locks are reservations on inputs to prevent double-spending
        const locks = fund.locked_utxos.map(utxo => ({
          expires_at: expirationAsDate(utxo.expiration),
          id: hexFromBuffer(utxo.id),
          transaction_id: txIdFromBuffer(utxo.outpoint.txid_bytes),
          transaction_vout: utxo.outpoint.output_index,
        }));

        // The funding inputs are encoded in the PSBT's unsigned tx
        const funding = tx.ins.map(({hash, index}) => ({
          transaction_id: txIdFromHash(hash),
          transaction_vout: index,
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
          outputs: tx.outs.map(({script, value}, index) => ({
            is_change: index === fund.change_output_index,
            output_script: hexFromBuffer(script),
            tokens: value,
          })),
          psbt: fund.psbt,
        });
      }],
    },
    returnResult({reject, resolve, of: 'funded'}, cbk));
  });
};
