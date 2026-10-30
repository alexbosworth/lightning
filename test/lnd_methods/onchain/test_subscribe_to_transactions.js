const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

const {subscribeToTransactions} = require('./../../../lnd_methods');
const {subscriptionEvents} = require('./../macros');

const cancelError = {details: 'Cancelled on client'};
const listenerFailure = {event: 'error', data: [503, 'ListenerFailure']};
const makeData = overrides => {
  const data = {
    amount: '1',
    block_hash: Buffer.alloc(32).toString('hex'),
    block_height: 1,
    dest_addresses: ['address'],
    num_confirmations: 1,
    previous_outpoints: [],
    raw_tx_hex: '00',
    time_stamp: '1',
    total_fees: '1',
    tx_hash: Buffer.alloc(32).toString('hex'),
  };

  Object.keys(overrides).forEach(k => data[k] = overrides[k]);

  return data;
};
const transaction = {
  event: 'chain_transaction',
  data: {
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
    transaction: '00',
  },
};

const tests = [
  {
    args: {},
    description: 'Removing the last transaction listener cancels the stream',
    expected: {cancels: ['cancel'], events: [{event: 'end', data: undefined}]},
    removing: ['error', 'chain_transaction'],
    stream: [['end']],
  },
  {
    args: {},
    description: 'Lnd is required to subscribe to transactions',
    error: 'ExpectedAuthenticatedLndToSubscribeToTransactions',
  },
  {
    args: {},
    description: 'Errors are returned',
    expected: {
      events: [
        {event: 'error', data: [503, 'UnexpectedChainTxSubErr', {err: 'err'}]},
      ],
    },
    stream: [['error', 'err']],
  },
  {
    args: {},
    description: 'A cancel error stops relaying from the stream',
    expected: {
      events: [
        {
          event: 'error',
          data: [503, 'UnexpectedChainTxSubErr', {err: cancelError}],
        },
      ],
    },
    stream: [['error', cancelError], ['data', makeData({})]],
  },
  {
    args: {},
    description: 'Stream errors are ignored without an error listener',
    expected: {events: []},
    listening: ['chain_transaction'],
    stream: [['error', 'err']],
  },
  {
    args: {},
    description: 'Transaction data is expected',
    expected: {
      events: [
        {
          event: 'error',
          data: [503, 'ExpectedTransactionAmountInChainTransaction'],
        },
      ],
    },
    stream: [['data', makeData({amount: undefined})]],
  },
  {
    args: {},
    description: 'Transaction data emitted',
    expected: {events: [transaction]},
  },
  {
    args: {},
    description: 'A throwing listener is reported without ending the stream',
    expected: {
      events: [transaction, listenerFailure, transaction, listenerFailure],
    },
    stream: [['data', makeData({})], ['data', makeData({})]],
    throwing: ['chain_transaction'],
  },
  {
    args: {},
    description: 'Status and end events are relayed',
    expected: {
      events: [
        {event: 'status', data: 'status'},
        {event: 'end', data: undefined},
      ],
    },
    stream: [['status', 'status'], ['end']],
  },
];

tests.forEach(({args, description, error, expected, ...scenario}) => {
  return test(description, async () => {
    if (!!error) {
      throws(() => subscribeToTransactions(args), new Error(error), 'Got err');

      return;
    }

    const got = await subscriptionEvents({
      ...scenario,
      events: ['chain_transaction', 'end', 'error', 'status'],
      stream: scenario.stream || [['data', makeData({})]],
      subscribe: stream => {
        args.lnd = {default: {subscribeTransactions: ({}) => stream}};

        return subscribeToTransactions(args);
      },
    });

    deepStrictEqual(got, {cancels: [], ...expected}, 'Got expected events');

    return;
  });
});
