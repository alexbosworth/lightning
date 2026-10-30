const {confirmedFromPayment} = require('./../../lnd_responses');
const {emitSubscriptionEvent} = require('./../../grpc');
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
      return emitSubscriptionEvent({
        emitter,
        data: confirmedFromPayment(data),
        event: 'confirmed',
      });

    case states.failed:
      return emitSubscriptionEvent({
        emitter,
        data: failureFromPayment(data),
        event: 'failed',
      });

    case states.paying:
      const hasHtlcs = !!data && isArray(data.htlcs) && !!data.htlcs.length;

      // Exit early when no HTLCs are attached
      if (!hasHtlcs) {
        return;
      }

      // Emit routing failures
      data.htlcs.filter(n => n.status === failedStatus).forEach(htlc => {
        return emitSubscriptionEvent({
          emitter,
          data: routingFailureFromHtlc(htlc),
          event: 'routing_failure',
        });
      });

      // Exit early when the HTLCs have no pending payments
      if (!data.htlcs.find(n => n.status === states.paying)) {
        return;
      }

      return emitSubscriptionEvent({
        emitter,
        data: pendingFromPayment(data),
        event: 'paying',
      });

    default:
      break;
    }
  } catch (err) {
    if (!emitter.listenerCount('error')) {
      return;
    }

    return emitter.emit('error', [503, err.message]);
  }
};
