const {confirmedFromPayment} = require('./../../lnd_responses');
const {failureFromPayment} = require('./../../lnd_responses');
const {pendingFromPayment} = require('./../../lnd_responses');
const {states} = require('./payment_states');

const {isArray} = Array;

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
      const hasHtlcs = !!data && isArray(data.htlcs) && !!data.htlcs.length;

      // Exit early when no HTLCs are attached
      if (!hasHtlcs) {
        return;
      }

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
