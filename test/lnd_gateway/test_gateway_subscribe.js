const EventEmitter = require('events');
const {once} = require('events');

const {encode} = require('cbor');
const {test} = require('@alexbosworth/tap');

const all = promise => Promise.all(promise);
const gatewaySubscribe = require('./../../lnd_gateway/gateway_subscribe');

const tests = [
  {
    args: {
      bearer: 'bearer',
      call: {
        arguments: {},
        method: 'method',
        server: 'server',
      },
      url: 'http://url',
    },
    description: '',
    expected: {
      message: 'a4686d616361726f6f6e66626561726572666d6574686f64666d6574686f6466706172616d73f76673657276657266736572766572',
      url: 'ws://url/',
    },
  },
];

tests.forEach(({args, description, expected}) => {
  return test(description, async ({equal, end}) => {
    const emitter = new EventEmitter();

    let message;

    function websocket(url) {
      equal(url, expected.url, 'Got expected url');

      emitter.close = () => {};

      emitter.send = n => {
        if (Buffer.from(n).toString('hex') !== expected.message) {
          throw new Error('GotUnexpectedMessageInWebSocket');
        }

        return end();
      };

      return emitter;
    }

    const eventEmitter = gatewaySubscribe({
      websocket,
      bearer: args.bearer,
      call: args.call,
      url: args.url,
    });

    emitter.emit('close');

    const [gotErr] = await all([
      new Promise((resolve, reject) => {
        eventEmitter.on('error', err => resolve(err));
      }),
      new Promise((resolve, reject) => {
        emitter.emit('error', new Error('Error'));

        return resolve();
      }),
    ]);

    equal(gotErr.toString(), 'Error: Error', 'Got error event');

    const [gotMessage] = await all([
      new Promise((resolve, reject) => {
        eventEmitter.on('event', data => resolve(data));
      }),
      new Promise((resolve, reject) => {
        emitter.emit('message', encode({event: 'event', data: 'data'}));

        return resolve();
      }),
    ]);

    equal(gotMessage, 'data', 'Got expected response');

    emitter.emit('open');

    emitter.emit('close');

    eventEmitter.cancel();
  });
});
