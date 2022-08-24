const {test} = require('@alexbosworth/tap');

const {getLockedUtxos} = require('./../../../lnd_methods');

const makeLnd = overrides => {
  return {
    wallet: {
      listLeases: ({}, cbk) => {
        const utxo = {
          expiration: '1',
          id: Buffer.alloc(32),
          outpoint: {
            output_index: 0,
            txid_str: Buffer.alloc(32).toString('hex'),
          },
          pk_script: Buffer.alloc(1),
          value: '1',
        };

        Object.keys(overrides).forEach(k => utxo[k] = overrides[k]);

        return cbk(null, {locked_utxos: [utxo]});
      },
    },
  };
};

const tests = [
  {
    args: {},
    description: 'LND Object is required to get locked utxos',
    error: [400, 'ExpectedLndToGetLockedUtxos'],
  },
  {
    args: {
      lnd: {wallet: {listLeases: ({}, cbk) => cbk({details: 'unknown'})}},
    },
    description: 'Unsupported error is passed back',
    error: [501, 'BackingLndDoesNotSupportGettingLockedUtxos'],
  },
  {
    args: {lnd: {wallet: {listLeases: ({}, cbk) => cbk('err')}}},
    description: 'Errors are passed back from get locked utxos method',
    error: [503, 'UnexpectedErrorGettingLockedUtxos', {err: 'err'}],
  },
  {
    args: {lnd: {wallet: {listLeases: ({}, cbk) => cbk()}}},
    description: 'A response is expected from list leases',
    error: [503, 'ExpectedResponseToGetLockedUtxoRequest'],
  },
  {
    args: {lnd: {wallet: {listLeases: ({}, cbk) => cbk(null, {})}}},
    description: 'An array of locked utxos is expected when getting utxos',
    error: [503, 'ExpectedExpirationDateForLockedUtxo'],
  },
  {
    args: {lnd: makeLnd({outpoint: undefined})},
    description: 'An outpoint is expected in a locked utxo',
    error: [503, 'UnexpectedErrorParsingLockedUtxosResponse'],
  },
  {
    args: {lnd: makeLnd({pk_script: undefined})},
    description: 'An output script is expected in a locked utxo',
    error: [503, 'ExpectedPkScriptForLockedUtxosInResponse'],
  },
  {
    args: {lnd: makeLnd({pk_script: Buffer.alloc(0), value: '0'})},
    description: 'Get legacy tx and map them to normalized transactions',
    expected: [{
      lock_expires_at: '1970-01-01T00:00:01.000Z',
      lock_id: '0000000000000000000000000000000000000000000000000000000000000000',
      output_script: undefined,
      tokens: undefined,
      transaction_id: Buffer.alloc(32).toString('hex'),
      transaction_vout: 0,
    }],
  },
  {
    args: {lnd: makeLnd({})},
    description: 'Get transactions and map them to normalized transactions',
    expected: [{
      lock_expires_at: '1970-01-01T00:00:01.000Z',
      lock_id: '0000000000000000000000000000000000000000000000000000000000000000',
      output_script: '00',
      tokens: 1,
      transaction_id: Buffer.alloc(32).toString('hex'),
      transaction_vout: 0,
    }],
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, rejects, strictSame}) => {
    if (!!error) {
      await rejects(() => getLockedUtxos(args), error, 'Got expected error');
    } else {
      const {utxos} = await getLockedUtxos(args);

      strictSame(utxos, expected, 'Got locked utxos');
    }

    return end();
  });
});
