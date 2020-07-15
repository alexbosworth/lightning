const {test} = require('@alexbosworth/tap');

const {getSweepTransactions} = require('./../../../lnd_methods');

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
    error: [503, 'ExpectedTransactionDetailsInGetSweepsResponse'],
  },
  {
    args: {
      lnd: {
        wallet: {
          listSweeps: ({}, cbk) => cbk(null, {transaction_details: {}}),
        },
      },
    },
    description: 'Transactions are expected in transaction details',
    error: [503, 'ExpectedArrayOfTransactioonsInSweepsResponse'],
  },
  {
    args: {
      lnd: {
        wallet: {
          listSweeps: ({}, cbk) => cbk(null, {
            transaction_details: {transactions: [{}]},
          }),
        },
      },
    },
    description: 'Sweep transactions must be well formed',
    error: [503, 'ExpectedTransactionAmountInChainTransaction'],
  },
  {
    args: {
      lnd: {
        wallet: {
          listSweeps: ({}, cbk) => cbk(null, {
            transaction_details: {
              transactions: [{
                amount: '1',
                block_hash: Buffer.alloc(32).toString('hex'),
                block_height: 1,
                dest_addresses: ['address'],
                num_confirmations: 1,
                raw_tx_hex: '00',
                time_stamp: '1',
                total_fees: '1',
                tx_hash: Buffer.alloc(32).toString('hex'),
              }],
            },
          }),
        },
      },
    },
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
        tokens: 1,
        transaction: '00',
      }],
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({deepEqual, end, equal, rejects}) => {
    if (!!error) {
      rejects(() => getSweepTransactions(args), error, 'Got expected error');
    } else {
      const res = await getSweepTransactions(args);

      deepEqual(res.transactions, expected.transactions, 'Got transactions');
    }

    return end();
  });
});
