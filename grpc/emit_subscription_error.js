const cancelError = 'Cancelled on client';

/** Get a function that emits an error from a gRPC subscription proxy

  {
    emitter: <Event Subscription Proxy Object>
    subscription: <gRPC Subscription Object>
  }

  @returns
  <Error Emission Function>
*/
module.exports = ({emitter, subscription}) => {
  return err => {
    subscription.cancel();

    if (!!err && err.details === cancelError) {
      subscription.removeAllListeners();
    }

    // Exit early when there are no error listeners
    if (!emitter.listenerCount('error')) {
      return;
    }

    return emitter.emit('error', err);
  };
};
