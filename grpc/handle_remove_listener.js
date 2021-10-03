const sumOf = arr => arr.reduce((sum, n) => sum + n, Number());

/** Get a function that emits an error from a gRPC subscription proxy

  {
    emitter: <EventEmitter Subscription Proxy Object>
    events: [<Event Name String>]
    subscription: <gRPC Subscription Object>
  }
*/
module.exports = ({emitter, events, subscription}) => {
  // Cancel the subscription when all listeners are removed
  emitter.on('removeListener', () => {
    const counts = events.map(n => emitter.listenerCount(n));

    // Exit early when there are still active listeners
    if (!!sumOf(counts)) {
      return;
    }

    subscription.cancel();

    return;
  });
};
