const {test} = require('@alexbosworth/tap');

const {rpcUtxoAsUtxo} = require('./../../lnd_responses');

const makeUtxo = override => {
  const utxo = {
    address: 'address',
    address_type: 'NESTED_PUBKEY_HASH',
    amount_sat: '1',
    confirmations: '1',
    outpoint: {
      output_index: 0,
      txid_str: Buffer.alloc(32).toString('hex'),
    },
    pk_script: '00',
  };

  Object.keys(override).forEach(key => utxo[key] = override[key]);

  return utxo;
};

const tests = [
  {
    args: null,
    description: 'An RPC UTXO is expected to map to a UTXO',
    error: 'ExpectedRpcUtxoToDeriveUtxoDetails',
  },
  {
    args: makeUtxo({address: undefined}),
    description: 'An address is expected',
    error: 'ExpectedAddressInUtxoResponse',
  },
  {
    args: makeUtxo({address_type: undefined}),
    description: 'An address type is expected',
    error: 'ExpectedAddressTypeInListedUtxo',
  },
  {
    args: makeUtxo({address_type: 'address_type'}),
    description: 'A known address type is expected',
    error: 'UnexpectedAddressTypeInUtxoResponse',
  },
  {
    args: makeUtxo({amount_sat: undefined}),
    description: 'An amount of tokens is expected',
    error: 'ExpectedValueOfUnspentOutputInUtxosResponse',
  },
  {
    args: makeUtxo({confirmations: undefined}),
    description: 'A confirmation count is expected',
    error: 'ExpectedConfCountForUtxoInUtxoResponse',
  },
  {
    args: makeUtxo({outpoint: undefined}),
    description: 'An outpoint is expected',
    error: 'ExpectedOutpointForUtxoInUtxosResponse',
  },
  {
    args: makeUtxo({outpoint: {txid_str: Buffer.alloc(32).toString('hex')}}),
    description: 'An outpoint with a vout is expected',
    error: 'ExpectedOutpointIndexForUtxoInUtxosResponse',
  },
  {
    args: makeUtxo({outpoint: {output_index: 0}}),
    description: 'An outpoint with a tx id is expected',
    error: 'ExpectedTransactionIdForUtxoInUtxosResponse',
  },
  {
    args: makeUtxo({pk_script: undefined}),
    description: 'An output script is expected',
    error: 'ExpectedScriptPubForUtxoInUtxosResponse',
  },
  {
    args: makeUtxo({}),
    description: 'RPC utxo is mapped to a utxo',
    expected: {
      address: 'address',
      address_format: 'np2wpkh',
      confirmation_count: 1,
      output_script: '00',
      tokens: 1,
      transaction_id: Buffer.alloc(32).toString('hex'),
      transaction_vout: 0,
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(({end, strictSame, throws}) => {
    if (!!error) {
      throws(() => rpcUtxoAsUtxo(args), new Error(error), 'Got error');
    } else {
      const utxo = rpcUtxoAsUtxo(args);

      strictSame(utxo, expected, 'Got expected UTXO details');
    }

    return end();
  });
});
