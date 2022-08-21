const EventEmitter = require('events');

const {test} = require('@alexbosworth/tap');

const {subscribeToTransactions} = require('./../../../lnd_methods');

const makeLnd = overrides => {
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

  return {
    default: {
      subscribeTransactions: ({}) => {
        const emitter = new EventEmitter();

        emitter.cancel = () => {};

        process.nextTick(() => emitter.emit('data', data));

        return emitter;
      },
    },
  };
};

const tests = [
  {
    args: {
      lnd: {
        default: {
          subscribeTransactions: ({}) => {
            const emitter = new EventEmitter();

            emitter.cancel = () => {};

            process.nextTick(() => emitter.emit('error', 'err'));

            return emitter;
          },
        },
      },
    },
    description: 'Errors are returned',
    error: [503, 'UnexpectedChainTxSubErr', {err: 'err'}],
  },
  {
    args: {
      lnd: {
        default: {
          subscribeTransactions: ({}) => {
            const emitter = new EventEmitter();

            emitter.cancel = () => {};

            process.nextTick(() => emitter.emit('error', {
              details: 'Cancelled on client',
            }));

            return emitter;
          },
        },
      },
    },
    description: 'Errors are returned',
    error: [
      503,
      'UnexpectedChainTxSubErr',
      {err: {details: 'Cancelled on client'}},
    ],
  },
  {
    args: {lnd: makeLnd({amount: undefined})},
    description: 'Transaction data is expected',
    error: [503, 'ExpectedTransactionAmountInChainTransaction'],
  },
  {
    args: {lnd: makeLnd({})},
    description: 'Transaction data emitted',
    expected: {
      block_id: '0000000000000000000000000000000000000000000000000000000000000000',
      confirmation_count: 1,
      confirmation_height: 1,
      created_at: '1970-01-01T00:00:01.000Z',
      description: undefined,
      fee: 1,
      id: '0000000000000000000000000000000000000000000000000000000000000000',
      inputs: [],
      is_confirmed: true,
      is_outgoing: false,
      output_addresses: ['address'],
      tokens: 1,
      transaction: '00',
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, ({end, equal, strictSame, throws}) => {
    try {
      subscribeToTransactions({});
    } catch (err) {
      strictSame(
        err,
        new Error('ExpectedAuthenticatedLndToSubscribeToTransactions'),
        'Requires lnd'
      );
    }

    const sub = subscribeToTransactions(args);

    if (!!error) {
      sub.once('chain_transaction', () => {});
      sub.once('error', err => {
        strictSame(err, error, 'Got expected error');

        subscribeToTransactions(args);

        process.nextTick(() => {
          sub.removeAllListeners();

          return end();
        });
      });
    } else {
      sub.once('chain_transaction', tx => {
        strictSame(tx, expected, 'Got expected chain transaction details');

        return end();
      });
    }

    return;
  });
});
