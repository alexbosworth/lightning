const {test} = require('@alexbosworth/tap');

const {getUtxos} = require('./../../../lnd_methods');

const makeExpected = overrides => {
  const utxo = {
    address: 'address',
    address_format: 'np2wpkh',
    confirmation_count: 1,
    output_script: '00',
    tokens: 1,
    transaction_id: Buffer.alloc(32).toString('hex'),
    transaction_vout: 0,
  };

  Object.keys(overrides).forEach(k => utxo[k] = overrides[k]);

  return {utxos: [utxo]};
};

const makeLnd = overrides => {
  return {
    default: {
      listUnspent: ({}, cbk) => {
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

        Object.keys(overrides).forEach(k => utxo[k] = overrides[k]);

        return cbk(null, {utxos: [utxo]});
      },
    },
    wallet: {
      listUnspent: ({}, cbk) => {
        return cbk('err');
      },
    },
  };
};

const tests = [
  {
    args: {},
    description: 'LND Object is required to get UTXOs',
    error: [400, 'ExpectedLndToGetUtxos'],
  },
  {
    args: {
      lnd: {
        default: {listUnspent: ({}, cbk) => cbk('err')},
        wallet: {listUnspent: ({}, cbk) => cbk('err')},
      },
    },
    description: 'LND errors are passed back',
    error: [503, 'UnexpectedErrorGettingUnspentTxOutputs'],
  },
  {
    args: {
      lnd: {
        default: {listUnspent: ({}, cbk) => cbk()},
        wallet: {listUnspent: ({}, cbk) => cbk('err')},
      },
    },
    description: 'A response is expected',
    error: [503, 'ExpectedResponseForListUnspentRequest'],
  },
  {
    args: {
      lnd: {
        default: {listUnspent: ({}, cbk) => cbk(null, {})},
        wallet: {listUnspent: ({}, cbk) => cbk('err')},
      },
    },
    description: 'A response with utxos is expected',
    error: [503, 'ExpectedUtxosInListUnspentsResponse'],
  },
  {
    args: {
      lnd: {
        default: {listUnspent: ({}, cbk) => cbk(null, {utxos: [null]})},
        wallet: {listUnspent: ({}, cbk) => cbk('err')},
      },
    },
    description: 'A response is expected',
    error: [503, 'ExpectedRpcUtxoToDeriveUtxoDetails'],
  },
  {
    args: {lnd: makeLnd({})},
    description: 'Get a list of utxos',
    expected: makeExpected({}),
  },
  {
    args: {
      lnd: {
        default: {listUnspent: ({}, cbk) => cbk('err')},
        wallet: {
          listUnspent: ({}, cbk) => cbk(null, {
            utxos: [{
              address: 'address',
              address_type: 'NESTED_PUBKEY_HASH',
              amount_sat: '1',
              confirmations: '1',
              outpoint: {
                output_index: 0,
                txid_str: Buffer.alloc(32).toString('hex'),
              },
              pk_script: '00',
            }],
          },
        )},
      },
    },
    description: 'Get a list of utxos from the non-legacy API',
    expected: makeExpected({}),
  },
  {
    args: {
      lnd: makeLnd({}),
      max_confirmations: 1,
      min_confirmations: 0,
    },
    description: 'Get a list of utxos with constraints',
    expected: makeExpected({}),
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, rejects, strictSame}) => {
    if (!!error) {
      await rejects(() => getUtxos(args), error, 'Got expected error');
    } else {
      const {utxos} = await getUtxos(args);

      strictSame(utxos, expected.utxos, 'Got utxos');
    }

    return end();
  });
});
