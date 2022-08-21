const {test} = require('@alexbosworth/tap');
const {Transaction} = require('bitcoinjs-lib');

const {getSweepTransactions} = require('./../../../lnd_methods');

const makeDefault = overrides => {
  const methods = {
    getTransactions: ({}, cbk) => {
      return cbk(null, {
        transactions: [{
          amount: '1',
          block_hash: Buffer.alloc(32).toString('hex'),
          block_height: 1,
          dest_addresses: ['address'],
          num_confirmations: 1,
          previous_outpoints: [],
          raw_tx_hex: (new Transaction()).toHex(),
          time_stamp: '1',
          total_fees: '1',
          tx_hash: Buffer.alloc(32).toString('hex'),
        }],
      });
    },
  };

  Object.keys(overrides).forEach(k => methods[k] = overrides[k]);

  return methods;
};

const makeWallet = overrides => {
  const wallet = {
    listSweeps: ({}, cbk) => cbk(null, {
      transaction_ids: {transaction_ids: [Buffer.alloc(32).toString('hex')]},
    }),
  };

  Object.keys(overrides).forEach(k => wallet[k] = overrides[k]);

  return wallet;
};

const tests = [
  {
    args: {},
    description: 'LND Object is required to get sweep transactions',
    error: [400, 'ExpectedLndToGetSweepTransactions'],
  },
  {
    args: {lnd: {wallet: {listSweeps: ({}, cbk) => cbk('err')}}},
    description: 'Errors are passed back',
    error: [503, 'UnexpectedGetSweepTxError', {err: 'err'}],
  },
  {
    args: {
      lnd: {
        wallet: {
          listSweeps: ({}, cbk) => cbk({
            details: 'unknown service walletrpc.WalletKit',
          }),
        },
      },
    },
    description: 'Sweep method not supported is returned',
    error: [501, 'BackingLndDoesNotSupportListingSweeps'],
  },
  {
    args: {lnd: {wallet: {listSweeps: ({}, cbk) => cbk()}}},
    description: 'A result is expected from the list sweeps method',
    error: [503, 'ExpectedResponseForGetSweepTxRequest'],
  },
  {
    args: {lnd: {wallet: {listSweeps: ({}, cbk) => cbk(null, {})}}},
    description: 'Transaction details are expected in sweeps response',
    error: [503, 'ExpectedTransactionIdsInSweepTxResponse'],
  },
  {
    args: {
      lnd: {
        wallet: {
          listSweeps: ({}, cbk) => cbk(null, {transaction_ids: {}}),
        },
      },
    },
    description: 'Transaction ids are expected in transaction details',
    error: [503, 'ExpectedArrayOfTransactionIdsInSweepsResponse'],
  },
  {
    args: {lnd: {default: makeDefault({}), wallet: makeWallet({})}},
    description: 'Sweep transactions are returned',
    expected: {
      transactions: [{
        block_id: Buffer.alloc(32).toString('hex'),
        confirmation_count: 1,
        confirmation_height: 1,
        created_at: '1970-01-01T00:00:01.000Z',
        description: undefined,
        fee: 1,
        id: Buffer.alloc(32).toString('hex'),
        is_confirmed: true,
        is_outgoing: false,
        output_addresses: ['address'],
        spends: [],
        tokens: 1,
        transaction: '01000000000000000000',
      }],
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, rejects, strictSame}) => {
    if (!!error) {
      await rejects(() => getSweepTransactions(args), error, 'Got error');
    } else {
      const res = await getSweepTransactions(args);

      strictSame(res.transactions, expected.transactions, 'Got transactions');
    }

    return end();
  });
});
