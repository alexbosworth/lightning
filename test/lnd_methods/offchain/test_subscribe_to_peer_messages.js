const EventEmitter = require('events');

const {test} = require('@alexbosworth/tap');

const {subscribeToPeerMessages} = require('./../../../lnd_methods');

const makeLnd = overrides => {
  const data = {
    data: Buffer.alloc(1),
    peer: Buffer.alloc(33, 3),
    type: 44444,
  };

  Object.keys(overrides).forEach(k => data[k] = overrides[k]);

  return {
    default: {
      SubscribeCustomMessages: ({}) => {
        const emitter = new EventEmitter();

        emitter.cancel = () => {};

        if (overrides.data === undefined) {
          process.nextTick(() => emitter.emit('data', data));
        } else {
          process.nextTick(() => emitter.emit('data', overrides.data));
        }

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
          SubscribeCustomMessages: ({}) => {
            const emitter = new EventEmitter();

            emitter.cancel = () => {};

            process.nextTick(() => emitter.emit('end'));
            process.nextTick(() => emitter.emit('status'));
            process.nextTick(() => emitter.emit('error', 'err'));

            return emitter;
          },
        },
      },
    },
    description: 'Errors are returned',
    error: 'err',
  },
  {
    args: {
      lnd: {
        default: {
          SubscribeCustomMessages: ({}) => {
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
    error: {details: 'Cancelled on client'},
  },
  {
    args: {lnd: makeLnd({peer: null})},
    description: 'A peer is expected',
    error: [503, 'ExpectedPeerPublicKeyBytesToDerivePeerMessage'],
  },
  {
    args: {lnd: makeLnd({})},
    description: 'Peer message event emitted',
    expected: {
      message: '00',
      public_key: Buffer.alloc(33, 3).toString('hex'),
      type: 44444,
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, ({end, equal, strictSame, throws}) => {
    try {
      subscribeToPeerMessages({});
    } catch (err) {
      strictSame(
        err,
        new Error('ExpectedLndToSubscribeToPeerMessages'), 'Needs lnd');
    }

    const sub = subscribeToPeerMessages(args);

    if (!!error) {
      sub.once('error', err => {
        strictSame(err, error, 'Got expected error');

        subscribeToPeerMessages(args);

        process.nextTick(() => {
          sub.removeAllListeners();

          return end();
        });
      });
    } else {
      if (!expected) {
        return end();
      }

      sub.once('message_received', message => {
        strictSame(message, expected, 'Got message received');

        return end();
      });
    }

    return;
  });
});
