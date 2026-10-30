const {deepEqual} = require('node:assert').strict;
const EventEmitter = require('node:events');
const test = require('node:test');
const {throws} = require('node:assert').strict;

const {emitSubscriptionEvent} = require('./../../grpc');

const tests = [
  {
    args: {},
    description: 'An emitter is required',
    error: 'ExpectedEventEmitterToEmitSubscriptionEvent',
  },
  {
    args: {emitter: new EventEmitter()},
    description: 'An event name is required',
    error: 'ExpectedEventNameToEmitSubscriptionEvent',
  },
  {
    args: {data: {id: 1}, event: 'event'},
    description: 'An event is delivered to a listener',
    expected: {errors: [], events: [{id: 1}]},
  },
  {
    args: {data: {id: 1}, event: 'event'},
    description: 'A throwing listener is reported as an error',
    expected: {errors: [[503, 'ListenerFailure']], events: [{id: 1}]},
    throwing: ['event'],
  },
  {
    args: {data: {id: 1}, event: 'event'},
    description: 'A throwing listener is ignored without an error listener',
    expected: {errors: [], events: [{id: 1}]},
    listening: ['event'],
    throwing: ['event'],
  },
];

tests.forEach(({args, description, error, expected, ...scenario}) => {
  return test(description, (t, end) => {
    if (!!error) {
      throws(() => emitSubscriptionEvent(args), new Error(error), 'Got error');

      return end();
    }

    const emitter = new EventEmitter();
    const errors = [];
    const events = [];

    // Listen for the event and for errors, unless the case only listens to one
    (scenario.listening || ['error', 'event']).forEach(event => {
      return emitter.on(event, data => {
        return event === 'error' ? errors.push(data) : events.push(data);
      });
    });

    // A throwing listener is a consumer defect that is reported as an error
    (scenario.throwing || []).forEach(event => {
      return emitter.on(event, () => {
        throw new Error('ListenerFailure');
      });
    });

    emitSubscriptionEvent({data: args.data, emitter, event: args.event});

    deepEqual({errors, events}, expected, 'Got expected emissions');

    return end();
  });
});
