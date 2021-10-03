const {test} = require('@alexbosworth/tap');

const {handleRemoveListener} = require('./../../grpc');

const tests = [
  {
    args: {
      emitter: {listenerCount: () => 0, on: (eventName, cbk) => cbk()},
      events: ['event'],
      subscription: {cancel: () => {}},
    },
    description: 'An error is emitted',
  },
  {
    args: {
      emitter: {listenerCount: () => 1, on: (eventName, cbk) => cbk()},
      events: ['event'],
      subscription: {
        cancel: () => {
          throw new Error('SubscriptionShouldNotBeCanceled');
        },
      },
    },
    description: 'An error is emitted',
  },
];

tests.forEach(({args, description, expected}) => {
  return test(description, ({end, equal}) => {
    handleRemoveListener(args);

    return end();
  });
});
