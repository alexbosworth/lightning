const EventEmitter = require('node:events');
const {strictEqual} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

const {Transaction} = require('bitcoinjs-lib');

const {subscribeToChainAddress} = require('./../../../lnd_methods');

const tests = [
  {
    args: {
      min_confirmations: 6,
      min_height: 100,
      output_script: 'a914898ffd60ad6091221250047a9f2bd6456190263487',
      transaction_id: Buffer.alloc(32).toString('hex'),
    },
    description: 'Confirmation emitted for output script',
    emitter: new EventEmitter(),
    expected: {
      block: Buffer.alloc(32).toString('hex'),
      height: 200,
      transaction: (new Transaction()).toHex(),
    },
  },
  {
    args: {
      min_confirmations: 6,
      min_height: 100,
      p2sh_address: '3EENzQdQS3BvvnkeJjC5uVwUKFuTczpnok',
      transaction_id: Buffer.alloc(32).toString('hex'),
    },
    description: 'Confirmation on p2sh emitted',
    emitter: new EventEmitter(),
    expected: {
      block: Buffer.alloc(32).toString('hex'),
      height: 200,
      transaction: (new Transaction()).toHex(),
    },
  },
  {
    args: {},
    description: 'Lnd is required to subscribe',
    error: 'ExpectedLndGrpcApiToSubscribeToChainTransaction',
  },
  {
    args: {lnd: {chain: {registerConfirmationsNtfn: () => {}}}},
    description: 'Min height is required',
    error: 'ExpectedMinHeightToSubscribeToChainAddress',
  },
  {
    args: {lnd: {chain: {registerConfirmationsNtfn: () => {}}}, min_height: 1},
    description: 'An output to watch for is required',
    error: 'ExpectedChainAddressToSubscribeForConfirmationEvents',
  },
];

tests.forEach(({args, description, emitter, error, expected}) => {
  return test(description, (t, end) => {
    if (!!error) {
      throws(() => subscribeToChainAddress(args), new Error(error), 'Got err');

      return end();
    }

    args.lnd = {chain: {registerConfirmationsNtfn: ({}) => emitter}};

    const sub = subscribeToChainAddress(args);

    sub.on('confirmation', ({block, height, transaction}) => {
      strictEqual(block, expected.block, 'Got block');
      strictEqual(height, expected.height, 'Got height');
      strictEqual(transaction, expected.transaction, 'Got transaction');

      return end();
    });

    emitter.emit('data', {
      conf: {
        block_hash: Buffer.alloc(32),
        block_height: 200,
        raw_tx: (new Transaction()).toBuffer(),
      },
    });

    return;
  });
});
