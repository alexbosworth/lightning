const constants = require('./constants');

const formats = constants.addressFormats;
const {keys} = Object;

/** Derive UTXO details from RPC UTXO details

  {
    address: <Chain Address String>
    address_type: <Address Type String>
    amount_sat: <UTXO Tokens Value String>
    confirmations: <Total Confirmation Count In Best Chain String>
    outpoint: {
      output_index: <Transaction Vout Index Number>
      txid_str: <Hex Encoded Transaction Id String>
    }
    pk_script: <Hex Encoded Public Key Output Script String>
  }

  @throws
  <Error>

  @returns
  {
    address: <Chain Address String>
    address_format: <Chain Address Format String>
    confirmation_count: <Confirmation Count Number>
    output_script: <Output Script Hex String>
    tokens: <Unspent Tokens Number>
    transaction_id: <Transaction Id Hex String>
    transaction_vout: <Transaction Output Index Number>
  }
*/
module.exports = utxo => {
  if (!utxo) {
    throw new Error('ExpectedRpcUtxoToDeriveUtxoDetails');
  }

  if (!utxo.address) {
    throw new Error('ExpectedAddressInUtxoResponse');
  }

  if (!utxo.address_type) {
    throw new Error('ExpectedAddressTypeInListedUtxo');
  }

  const format = keys(formats).find(k => formats[k] === utxo.address_type);

  if (!format) {
    throw new Error('UnexpectedAddressTypeInUtxoResponse');
  }

  if (!utxo.amount_sat) {
    throw new Error('ExpectedValueOfUnspentOutputInUtxosResponse');
  }

  if (utxo.confirmations === undefined) {
    throw new Error('ExpectedConfCountForUtxoInUtxoResponse');
  }

  if (!utxo.outpoint) {
    throw new Error('ExpectedOutpointForUtxoInUtxosResponse');
  }

  if (utxo.outpoint.output_index === undefined) {
    throw new Error('ExpectedOutpointIndexForUtxoInUtxosResponse');
  }

  if (!utxo.outpoint.txid_str) {
    throw new Error('ExpectedTransactionIdForUtxoInUtxosResponse');
  }

  if (!utxo.pk_script) {
    throw new Error('ExpectedScriptPubForUtxoInUtxosResponse');
  }

  return {
    address: utxo.address,
    address_format: format,
    confirmation_count: Number(utxo.confirmations),
    output_script: utxo.pk_script,
    tokens: Number(utxo.amount_sat),
    transaction_id: utxo.outpoint.txid_str,
    transaction_vout: utxo.outpoint.output_index,
  };
};
