const {rejects} = require('node:assert').strict;
const {strictEqual} = require('node:assert').strict;
const test = require('node:test');

const {broadcastChainTransaction} = require('./../../../lnd_methods');
const {transaction, transactionId} = require('./../fixtures/transaction');

const tests = [
  {
    args: {},
    description: 'LND is required',
    error: [400, 'ExpectedWalletRpcLndToSendRawTransaction'],
  },
  {
    args: {lnd: {wallet: {publishTransaction: ({}, cbk) => cbk()}}},
    description: 'Raw transaction is required',
    error: [400, 'ExpectedTransactionHexStringToBroadcastToPeers'],
  },
  {
    args: {
      transaction,
      lnd: {wallet: {publishTransaction: ({}, cbk) => cbk('err')}},
    },
    description: 'Expected error is returned',
    error: [503, 'UnexpectedErrBroadcastingRawTx', {err: 'err'}],
  },
  {
    args: {
      transaction,
      lnd: {wallet: {publishTransaction: ({}, cbk) => cbk()}},
    },
    description: 'A result is required',
    error: [503, 'ExpectedResultOfBroadcastRawTransaction'],
  },
  {
    args: {
      transaction,
      lnd: {
        wallet: {
          publishTransaction: ({}, cbk) => cbk(null, {publish_error: 'err'}),
        },
      },
    },
    description: 'Failure to broadcast error is returned',
    error: [
      503,
      'FailedToBroadcastRawTransaction',
      {res: {publish_error: 'err'}},
    ],
  },
  {
    args: {
      transaction,
      lnd: {
        wallet: {
          publishTransaction: ({}, cbk) => cbk({
            details: 'unmatched backend error: -26: mempool min fee not met, 123 < 1234',
          }),
        },
      },
    },
    description: 'Minimum relay fee not met',
    error: [
      503,
      'ChainBackendMinimumRelayFeeNotMet',
      {
        fee: 123,
        minimum: 1234,
      },
    ],
  },
  {
    args: {
      transaction,
      lnd: {wallet: {publishTransaction: ({}, cbk) => cbk(null, {})}},
    },
    description: 'A transaction is published',
    expected: {
      id: transactionId,
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async () => {
    if (!!error) {
      await rejects(() => broadcastChainTransaction(args), error, 'Got error');
    } else {
      const {id} = await broadcastChainTransaction(args);

      strictEqual(id, expected.id, 'Got fee rate');
    }

    return;
  });
});
