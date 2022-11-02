const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const inputSigningMethod = require('./input_signing_method');
const {isLnd} = require('./../../lnd_requests');

const bufferAsHex = buffer => buffer.toString('hex');
const hexAsBuffer = hex => Buffer.from(hex || '', 'hex');
const {isArray} = Array;
const isV1 = scriptHex => scriptHex.length === 68 && /5120/.test(scriptHex);
const method = 'signOutputRaw';
const notFound = -1;
const type = 'signer';
const unimplementedError = '12 UNIMPLEMENTED: unknown service signrpc.Signer';

/** Sign transaction

  `spending` is required for non-internal inputs for a Taproot signature

  Requires LND built with `signrpc` build tag

  Requires `signer:generate` permission

  `root_hash` is not supported in LND 0.14.5 and below
  `spending` is not supported in LND 0.14.5 and below

  {
    inputs: [{
      key_family: <Key Family Number>
      key_index: <Key Index Number>
      output_script: <Output Script Hex String>
      output_tokens: <Output Tokens Number>
      [root_hash]: <Taproot Root Hash Hex String>
      sighash: <Sighash Type Number>
      vin: <Input Index To Sign Number>
      [witness_script]: <Witness Script Hex String>
    }]
    lnd: <Authenticated LND API Object>
    [spending]: [{
      output_script: <Non-Internal Spend Output Script Hex String>
      output_tokens: <Non-Internal Spend Output Tokens Number>
    }]
    transaction: <Unsigned Transaction Hex String>
  }

  @returns via cbk or Promise
  {
    signatures: [<Signature Hex String>]
  }
*/
module.exports = ({inputs, lnd, spending, transaction}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isArray(inputs) || !inputs.length) {
          return cbk([400, 'ExpectedInputsToSignTransaction']);
        }

        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedAuthenticatedLndToSignTransaction']);
        }

        if (!transaction) {
          return cbk([400, 'ExpectedUnsignedTransactionToSign']);
        }

        return cbk();
      },

      // Derive the previous outputs set for Taproot spends
      outputs: ['validate', ({}, cbk) => {
        const outputs = [].concat(inputs).concat(spending || []).map(utxo => ({
          pk_script: hexAsBuffer(utxo.output_script),
          value: utxo.output_tokens,
        }));

        const v1Spends = outputs.filter(n => isV1(bufferAsHex(n.pk_script)));

        // Exit early when there is no need to provide prev outs, non-taproot
        if (!v1Spends.length) {
          return cbk();
        }

        return cbk(null, outputs);
      }],

      // Get signatures
      signTransaction: ['outputs', ({outputs}, cbk) => {
        return lnd[type][method]({
          prev_outputs: outputs,
          raw_tx_bytes: hexAsBuffer(transaction),
          sign_descs: inputs.map(input => {
            return {
              input_index: input.vin,
              key_desc: {
                key_loc: {
                  key_family: input.key_family,
                  key_index: input.key_index,
                },
              },
              output: {
                pk_script: hexAsBuffer(input.output_script),
                value: input.output_tokens,
              },
              sighash: input.sighash,
              sign_method: inputSigningMethod({input, outputs}).method,
              tap_tweak: hexAsBuffer(input.root_hash),
              witness_script: hexAsBuffer(input.witness_script),
            };
          }),
        },
        (err, res) => {
          if (!!err && err.message === unimplementedError) {
            return cbk([400, 'ExpectedLndBuiltWithSignerRpcBuildTag']);
          }

          if (!!err) {
            return cbk([503, 'UnexpectedErrorWhenSigning', {err}]);
          }

          if (!res) {
            return cbk([503, 'UnexpectedEmptyResponseWhenSigning']);
          }

          if (!isArray(res.raw_sigs) || !res.raw_sigs.length) {
            return cbk([503, 'ExpectedSignaturesInSignatureResponse']);
          }

          if (res.raw_sigs.findIndex(n => !Buffer.isBuffer(n)) !== notFound) {
            return cbk([503, 'ExpectedSignatureBuffersInSignResponse']);
          }

          return cbk(null, {signatures: res.raw_sigs.map(bufferAsHex)});
        });
      }],
    },
    returnResult({reject, resolve, of: 'signTransaction'}, cbk));
  });
};
