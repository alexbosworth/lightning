const EventEmitter = require('node:events');

const settle = () => new Promise(resolve => setImmediate(resolve));

/** Collect the events a subscription emits for a replayed mock stream

  {
    events: [<Subscription Event Name String>]
    [handling]: {
      <Event Name String>: <Handle Event Returning Data To Record Function>
    }
    [listening]: [<Listened For Event Name String>]
    [removing]: [<Event Name To Remove Listeners For After Replay String>]
    stream: [[<Stream Event Name String>, <Stream Event Data Object>]]
    subscribe: <Subscribe Function> (stream) => <Subscription EventEmitter>
    [throwing]: [<Event Name With Throwing Listener String>]
  }

  @returns via Promise
  {
    cancels: [<Cancel String>]
    events: [{
      data: <Event Data Object>
      event: <Event Name String>
    }]
  }
*/
module.exports = async args => {
  const cancels = [];
  const events = [];
  const stream = new EventEmitter();

  stream.cancel = () => cancels.push('cancel');

  const sub = await args.subscribe(stream);

  // Events are recorded as emitted, unless the case handles them first
  (args.listening || args.events).forEach(event => {
    const handle = (args.handling || {})[event] || (data => data);

    return sub.on(event, data => events.push({event, data: handle(data)}));
  });

  // A throwing listener is a consumer defect and must not end the stream
  (args.throwing || []).forEach(event => {
    return sub.on(event, () => {
      throw new Error('ListenerFailure');
    });
  });

  args.stream.forEach(([event, data]) => stream.emit(event, data));

  await settle();

  (args.removing || []).forEach(event => sub.removeAllListeners(event));

  return {cancels, events};
};
