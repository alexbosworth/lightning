const {test} = require('@alexbosworth/tap');

const {rpcTxAsTransaction} = require('./../../lnd_responses');

const makeTx = override => {
  const tx = {
    amount: '1',
    block_hash: Buffer.alloc(32).toString('hex'),
    block_height: 1,
    dest_addresses: ['address'],
    num_confirmations: 1,
    previous_outpoints: [
      {
        is_our_output: true,
        outpoint: `${Buffer.alloc(32).toString('hex')}:1`,
      },
      {
        is_our_output: true,
        outpoint: `${Buffer.alloc(32, 1).toString('hex')}:1`,
      },
    ],
    raw_tx_hex: '00',
    time_stamp: '1',
    total_fees: '1',
    tx_hash: Buffer.alloc(32).toString('hex'),
  };

  Object.keys(override).forEach(key => tx[key] = override[key]);

  return tx;
};

const tests = [
  {
    args: null,
    description: 'A tx is expected to map to a transaction',
    error: 'ExpectedRpcTransactionToDeriveTransactionDetails',
  },
  {
    args: makeTx({amount: undefined}),
    description: 'An amount is expected',
    error: 'ExpectedTransactionAmountInChainTransaction',
  },
  {
    args: makeTx({block_hash: '00'}),
    description: 'A block hash is expected',
    error: 'ExpectedTransactionBlockHashInChainTx',
  },
  {
    args: makeTx({block_height: undefined}),
    description: 'A block height is expected',
    error: 'ExpectedChainTransactionBlockHeightNumber',
  },
  {
    args: makeTx({dest_addresses: undefined}),
    description: 'Destination addresses are expected',
    error: 'ExpectedChainTransactionDestinationAddresses',
  },
  {
    args: makeTx({dest_addresses: ['']}),
    description: 'Non empty destination addresses are expected',
    error: 'ExpectedDestinationAddressesInChainTx',
  },
  {
    args: makeTx({num_confirmations: undefined}),
    description: 'Confirmation count is expected',
    error: 'ExpectedChainTransactionConfirmationsCount',
  },
  {
    args: makeTx({previous_outpoints: undefined}),
    description: 'Previous outpoints are expected',
    error: 'ExpectedArrayOfPreviousOutpointsInRpcTransaction',
  },
  {
    args: makeTx({previous_outpoints: [{}]}),
    description: 'An outpoint spend is expected',
    error: 'ExpectedPreviousOutpointInRpcTransaction',
  },
  {
    args: makeTx({previous_outpoints: [{outpoint: '00'}]}),
    description: 'An outpoint with a tx id is expected',
    error: 'ExpectedOutpointSpendingTransactionIdInRpcTx',
  },
  {
    args: makeTx({
      previous_outpoints: [{
        outpoint: `${Buffer.alloc(32, 1).toString('hex')}`,
      }],
    }),
    description: 'An outpoint with a tx vout is expected',
    error: 'ExpectedOutpointSpendingTransactionVoutInRpcTx',
  },
  {
    args: makeTx({
      previous_outpoints: [{
        outpoint: `${Buffer.alloc(32, 1).toString('hex')}:1`,
      }],
    }),
    description: 'Local status for spend is expected',
    error: 'ExpectedOutpointOwnershipBooleanInRpcTransaction',
  },
  {
    args: makeTx({time_stamp: undefined}),
    description: 'A time stamp is expected',
    error: 'ExpectedChainTransactionTimestamp',
  },
  {
    args: makeTx({total_fees: undefined}),
    description: 'Total fees are expected',
    error: 'ExpectedChainTransactionTotalFees',
  },
  {
    args: makeTx({tx_hash: undefined}),
    description: 'A transaction hash is expected',
    error: 'ExpectedChainTransactionId',
  },
  {
    args: makeTx({}),
    description: 'RPC transaction is mapped to transaction',
    expected: {
      block_id: Buffer.alloc(32).toString('hex'),
      confirmation_count: 1,
      confirmation_height: 1,
      created_at: '1970-01-01T00:00:01.000Z',
      description: undefined,
      fee: 1,
      id: Buffer.alloc(32).toString('hex'),
      inputs: [{
        is_local: true,
        transaction_id: '0101010101010101010101010101010101010101010101010101010101010101',
        transaction_vout: 1,
      }],
      is_confirmed: true,
      is_outgoing: false,
      output_addresses: ['address'],
      tokens: 1,
      transaction: '00',
    },
  },
  {
    args: makeTx({
      amount: '-1',
      block_hash: '',
      block_height: 0,
      num_confirmations: 0,
      previous_outpoints: [],
      raw_tx_hex: '',
      total_fees: '0',
    }),
    description: 'Unconfirmed RPC transaction is mapped to transaction',
    expected: {
      block_id: undefined,
      confirmation_count: undefined,
      confirmation_height: undefined,
      created_at: '1970-01-01T00:00:01.000Z',
      description: undefined,
      fee: undefined,
      id: Buffer.alloc(32).toString('hex'),
      inputs: [],
      is_confirmed: false,
      is_outgoing: true,
      output_addresses: ['address'],
      tokens: 1,
      transaction: undefined,
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(({end, strictSame, throws}) => {
    if (!!error) {
      throws(() => rpcTxAsTransaction(args), new Error(error), 'Got error');
    } else {
      const transaction = rpcTxAsTransaction(args);

      strictSame(transaction, expected, 'Got expected transaction details');
    }

    return end();
  });
});
