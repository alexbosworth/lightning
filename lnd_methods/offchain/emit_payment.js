const {confirmedFromPayment} = require('./../../lnd_responses');
const {failureFromPayment} = require('./../../lnd_responses');
const {pendingFromPayment} = require('./../../lnd_responses');
const {routingFailureFromHtlc} = require('./../../lnd_responses');
const {states} = require('./payment_states');

const failedStatus = 'FAILED';
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

      // Emit routing failures
      data.htlcs.filter(n => n.status === failedStatus).forEach(htlc => {
        return emitter.emit('routing_failure', routingFailureFromHtlc(htlc));
      });

      // Exit early when the HTLCs have no pending payments
      if (!data.htlcs.find(n => n.status === states.paying)) {
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
