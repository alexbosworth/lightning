const errorEvent = 'error';

/** Emit an event from a gRPC subscription proxy

  {
    [data]: <Event Data Object>
    emitter: <Event Subscription Proxy Object>
    event: <Event Name String>
  }

  @throws
  <Error>
*/
module.exports = ({data, emitter, event}) => {
  if (!emitter) {
    throw new Error('ExpectedEventEmitterToEmitSubscriptionEvent');
  }

  if (!event) {
    throw new Error('ExpectedEventNameToEmitSubscriptionEvent');
  }

  // A throwing listener is a consumer defect, report it and keep the stream
  try {
    return emitter.emit(event, data);
  } catch (err) {
    // Exit early when there are no error listeners
    if (!emitter.listenerCount(errorEvent)) {
      return;
    }

    return emitter.emit(errorEvent, [503, err.message]);
  }
};
