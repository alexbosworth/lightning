const EventEmitter = require('events');
const {once} = require('events');

const {encode} = require('cbor');
const {test} = require('@alexbosworth/tap');

const emitEvent = require('./../../lnd_gateway/emit_event');

const all = promise => Promise.all(promise);

const tests = [
  {
    args: {message: encode({event: 'event', data: 'data'})},
    description: 'Emitter emits CBOR encoded event data',
    expected: {event: 'event', emitted: 'data'},
  },
  {
    args: {message: Buffer.alloc(3)},
    description: 'Emitter emits error when CBOR is invalid',
    error: new Error('FailedToDecodeGatewayResponse'),
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, rejects, strictSame}) => {
    const emitter = new EventEmitter();
    const message = args.message;

    const emit = new Promise((resolve, reject) => {
      emitEvent({emitter, message});

      return resolve();
    });

    const waitForError = new Promise((resolve, reject) => {
      emitter.on('error', err => reject(err));
    });

    if (!!error) {
      await rejects(all([emit, waitForError]), error, 'Got error');
    } else {
      const [, [emitted]] = await all([emit, once(emitter, expected.event)]);

      strictSame(emitted, expected.emitted, 'Got expected emitted data');
    }

    return end();
  });
});
