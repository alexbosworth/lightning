const EventEmitter = require('events');

const {test} = require('@alexbosworth/tap');

const {subscribeToBlocks} = require('./../../../lnd_methods');

const makeLnd = overrides => {
  const data = {hash: Buffer.alloc(32), height: 1};

  Object.keys(overrides).forEach(k => data[k] = overrides[k]);

  return {
    chain: {
      registerBlockEpochNtfn: ({}) => {
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
        chain: {
          registerBlockEpochNtfn: ({}) => {
            const emitter = new EventEmitter();

            emitter.cancel = () => {};

            process.nextTick(() => emitter.emit('error', 'err'));

            return emitter;
          },
        },
      },
    },
    description: 'Errors are returned',
    error: [503, 'UnexpectedErrInBlocksSubscription', {err: 'err'}],
  },
  {
    args: {lnd: makeLnd({hash: undefined})},
    description: 'Block data is expected',
    error: [503, 'ExpectedBlockHashInAnnouncement'],
  },
  {
    args: {lnd: makeLnd({hash: Buffer.alloc(1)})},
    description: 'Block hash is expected',
    error: [503, 'UnexpectedBlockEventHashLength'],
  },
  {
    args: {lnd: makeLnd({height: undefined})},
    description: 'Height is expected',
    error: [503, 'ExpectedHeightInBlockEvent'],
  },
  {
    args: {lnd: makeLnd({})},
    description: 'Block data emitted',
    expected: {height: 1, id: Buffer.alloc(32).toString('hex')},
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, ({end, equal, strictSame, throws}) => {
    try {
      subscribeToBlocks({});
    } catch (err) {
      strictSame(err, new Error('ExpectedLndToSubscribeToBlocks'), 'no lnd');
    }

    const sub = subscribeToBlocks(args);

    if (!!error) {
      sub.once('block', () => {});
      sub.once('error', err => {
        strictSame(err, error, 'Got expected error');

        subscribeToBlocks(args);

        process.nextTick(() => {
          sub.removeAllListeners();

          return end();
        });
      });
    } else {
      sub.once('block', ({height, id}) => {
        equal(height, expected.height, 'Got height');
        equal(id, expected.id, 'Got id');

        return end();
      });
    }

    return;
  });
});
