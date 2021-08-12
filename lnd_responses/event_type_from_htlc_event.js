const {htlcEventTypes} = require('./constants');
const {htlcTypes} = require('./constants');

/** Determine the type of event that an HTLC event represents

  {
    event: {
      forward_event: {}
      forward_fail_event: {}
      link_fail_event: {}
      settle_event: {}
    }
    event_type: <Event Type String>
  }

  @throws
  <Error>

  @returns
  {
    [event]: <Event Type String>
  }
*/
module.exports = htlc => {
  if (!htlc) {
    throw new Error('ExpectedHtlcEventDataToDeriveEventType');
  }

  switch (htlc.event_type) {
  case htlcEventTypes.forward:
    if (!!htlc.event.forward_event) {
      return {event: htlcTypes.forward_accepted};
    }

    if (!!htlc.event.forward_fail_event) {
      return {event: htlcEventTypes.forward_failed};
    }

    if (!!htlc.event.link_fail_event) {
      return {event: htlcEventTypes.forward_failed};
    }

    if (!!htlc.event.settle_event) {
      return {event: htlcEventTypes.forward_confirmed};
    }

    return {};

  default:
    return {};
  }

  if (!!htlc.event.forward_event && htlc.event_type === htlcEventTypes) {
    return {event: 'forward'};
  }

  if (!!htlc.event.forward_fail_event || !!htlc.event.link_fail_event) {
    return {event: 'routing_failure'};
  }

  if (!!htlc.event.settle_event && htlc.event.event_type === 'SEND') {
    return {event: 'payment_confirmed'};
  }

  if (!!htlc.event.settle_event && htlc.event.event_type === 'RECEIVE') {
    return {event: 'invoice_confirmed'};
  }

  return {};
};
