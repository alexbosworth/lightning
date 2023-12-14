const {deepStrictEqual} = require('node:assert').strict;
const {rejects} = require('node:assert').strict;
const test = require('node:test');

const {getChainTransaction} = require('./../../../lnd_methods');

const makeExpected = overrides => {
  const transaction = {
    block_id: Buffer.alloc(32).toString('hex'),
    confirmation_count: 1,
    confirmation_height: 1,
    created_at: '1970-01-01T00:00:01.000Z',
    description: undefined,
    fee: 1,
    id: Buffer.alloc(32).toString('hex'),
    inputs: [],
    is_confirmed: true,
    is_outgoing: false,
    output_addresses: ['address'],
    tokens: 1,
    transaction: undefined,
  };

  Object.keys(overrides).forEach(k => transaction[k] = overrides[k]);

  return transaction;
};

const makeLnd = overrides => {
  return {
    wallet: {
      getTransaction: ({}, cbk) => {
        const transaction = {
          amount: '1',
          block_hash: Buffer.alloc(32).toString('hex'),
          block_height: 1,
          dest_addresses: ['address'],
          num_confirmations: 1,
          previous_outpoints: [],
          time_stamp: '1',
          total_fees: '1',
          tx_hash: Buffer.alloc(32).toString('hex'),
        };

        Object.keys(overrides).forEach(k => transaction[k] = overrides[k]);

        return cbk(null, transaction);
      },
    },
  };
};

const tests = [
  {
    args: {},
    description: 'An id is required to get a chain transaction',
    error: [400, 'ExpectedIdentifyingTxHashOfChainTxToRetrieve'],
  },
  {
    args: {id: Buffer.alloc(32).toString('hex')},
    description: 'LND Object is required to get a chain transaction',
    error: [400, 'ExpectedLndToGetChainTransaction'],
  },
  {
    args: {
      id: Buffer.alloc(32).toString('hex'),
      lnd: {wallet: {getTransaction: ({}, cbk) => cbk('err')}},
    },
    description: 'Errors are passed back from get transaction method',
    error: [503, 'UnexpectedGetChainTransactionError', {err: 'err'}],
  },
  {
    args: {
      id: Buffer.alloc(32).toString('hex'),
      lnd: {
        wallet: {
          getTransaction: ({}, cbk) => cbk({
            details: 'unknown walletrpc.WalletKit',
          }),
        },
      },
    },
    description: 'Unsupported errors are returned',
    error: [501, 'GetChainTransactionMethodNotSupported'],
  },
  {
    args: {
      id: Buffer.alloc(32).toString('hex'),
      lnd: {wallet: {getTransaction: ({}, cbk) => cbk()}},
    },
    description: 'A response is expected from get transaction',
    error: [503, 'ExpectedRpcTransactionToDeriveTransactionDetails'],
  },
  {
    args: {
      id: Buffer.alloc(32).toString('hex'),
      lnd: makeLnd({amount: null}),
    },
    description: 'An amount is expected in a chain transaction',
    error: [503, 'ExpectedTransactionAmountInChainTransaction'],
  },
  {
    args: {
      id: Buffer.alloc(32).toString('hex'),
      lnd: makeLnd({}),
    },
    description: 'Get transaction returns normalized transaction',
    expected: makeExpected({}),
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async () => {
    if (!!error) {
      await rejects(() => getChainTransaction(args), error, 'Got err');
    } else {
      const transaction = await getChainTransaction(args);

      deepStrictEqual(transaction, expected, 'Got transaction');
    }

    return;
  });
});
