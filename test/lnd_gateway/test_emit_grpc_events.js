const EventEmitter = require('events');

const {test} = require('@alexbosworth/tap');

const {emitGrpcEvents} = require('./../../');

const tests = [
  {
    args: {message: Buffer.alloc(3)},
    description: 'When ',
    expected: {
      message: 'a26464617461a16764657461696c73781a457870656374656456616c696443626f7257734d657373616765656576656e74656572726f72',
    },
  },
];

tests.forEach(({args, description, expected}) => {
  return test(description, ({equal, end}) => {
    const ws = new EventEmitter();

    ws.send = message => {
      equal(message.toString('hex'), expected.message, 'Got expected msg');

      return end();
    };

    emitGrpcEvents({ws});

    ws.emit('message', args.message);
  });
});
