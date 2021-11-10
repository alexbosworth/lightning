const {confirmedFromPayment} = require('./../../lnd_responses');
const {failureFromPayment} = require('./../../lnd_responses');
const {pendingFromPayment} = require('./../../lnd_responses');
const {states} = require('./payment_states');

/** Emit payment from payment event

  {
    data: {
      status: <Status String>
    }
    emitter: <EventEmitter Object>
  }
*/
module.exports = ({data, emitter}) => {
  try {
    switch (data.status) {
    case states.confirmed:
      return emitter.emit('confirmed', confirmedFromPayment(data));

    case states.failed:
      return emitter.emit('failed', failureFromPayment(data));

    case states.paying:
      return emitter.emit('paying', pendingFromPayment(data));

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
