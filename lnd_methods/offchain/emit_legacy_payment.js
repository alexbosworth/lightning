const {confirmedFromPaymentStatus} = require('./../../lnd_responses');
const {stateAsFailure} = require('./../../lnd_responses');
const {states} = require('./payment_states');

/** Emit legacy payment

  This emits a payment using the payment state from LND 0.9.2 and below

  {
    data: {
      state: <Payment State String>
    }
    emitter: <EventEmitter Object>
  }
*/
module.exports = ({data, emitter}) => {
  try {
    switch (data.state) {
    case states.confirmed:
      return emitter.emit('confirmed', confirmedFromPaymentStatus(data));

    case states.errored:
    case states.invalid_payment:
    case states.insufficient_balance:
    case states.pathfinding_routes_failed:
    case states.pathfinding_timeout_failed:
      return emitter.emit('failed', stateAsFailure(data));

    case states.paying:
      return emitter.emit('paying', {});

    default:
      return;
    }
  } catch (err) {
    if (!emitter.listenerCount('error')) {
      return;
    }

    return emitter.emit('error', [503, err.message]);
  }
};
