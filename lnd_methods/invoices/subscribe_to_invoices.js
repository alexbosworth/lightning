const EventEmitter = require('events');

const asyncDoUntil = require('async/doUntil');

const {handleRemoveListener} = require('./../../grpc');
const {isLnd} = require('./../../lnd_requests');
const {rpcInvoiceAsInvoice} = require('./../../lnd_responses');

const connectionFailureMessage = 'failed to connect to all addresses';
const events = ['end', 'error', 'invoice_updated', 'status'];
const msPerSec = 1e3;
const restartSubscriptionMs = 1000 * 30;
const sumOf = arr => arr.reduce((sum, n) => sum + n, Number());
const updateEvent = 'invoice_updated';

/** Subscribe to invoices

  Requires `invoices:read` permission

  `payment` is not supported on LND 0.11.1 and below

  {
    [added_after]: <Invoice Added After Index Number>
    [confirmed_after]: <Invoice Confirmed After Index Number>
    lnd: <Authenticated LND API Object>
    [restart_delay_ms]: <Restart Subscription Delay Milliseconds Number>
  }

  @throws
  <Error>

  @returns
  <EventEmitter Object>

  @event 'invoice_updated'
  {
    [chain_address]: <Fallback Chain Address String>
    cltv_delta: <Final CLTV Delta Number>
    [confirmed_at]: <Confirmed At ISO 8601 Date String>
    [confirmed_index]: <Confirmed Index Number>
    created_at: <Created At ISO 8601 Date String>
    description: <Description String>
    description_hash: <Description Hash Hex String>
    expires_at: <Expires At ISO 8601 Date String>
    features: [{
      bit: <Feature Bit Number>
      is_known: <Is Known Feature Bool>
      is_required: <Feature Is Required Bool>
      name: <Feature Name String>
    }]
    id: <Invoice Payment Hash Hex String>
    index: <Invoice Index Number>
    is_confirmed: <Invoice is Confirmed Bool>
    [is_push]: <Invoice is Push Payment Bool>
    mtokens: <Invoiced Millitokens String>
    [payment]: <Payment Identifying Secret Hex String>
    payments: [{
      [confirmed_at]: <Payment Settled At ISO 8601 Date String>
      created_at: <Payment Held Since ISO 860 Date String>
      created_height: <Payment Held Since Block Height Number>
      in_channel: <Incoming Payment Through Channel Id String>
      is_canceled: <Payment is Canceled Bool>
      is_confirmed: <Payment is Confirmed Bool>
      is_held: <Payment is Held Bool>
      messages: [{
        type: <Message Type Number String>
        value: <Raw Value Hex String>
      }]
      mtokens: <Incoming Payment Millitokens String>
      [pending_index]: <Pending Payment Channel HTLC Index Number>
      tokens: <Payment Tokens Number>
      [total_mtokens]: <Total Payment Millitokens String>
    }]
    received: <Received Tokens Number>
    received_mtokens: <Received Millitokens String>
    [request]: <BOLT 11 Payment Request String>
    secret: <Payment Secret Hex String>
    tokens: <Invoiced Tokens Number>
  }
*/
module.exports = args => {
  if (!isLnd({lnd: args.lnd, method: 'subscribeInvoices', type: 'default'})) {
    throw new Error('ExpectedAuthenticatedLndToSubscribeInvoices');
  }

  let addIndex = args.added_after;
  let confirmedAfter = args.confirmed_after;
  const eventEmitter = new EventEmitter();

  asyncDoUntil(cbk => {
    // Safeguard the callback from being fired multiple times
    let isFinished = false;

    // Start the subscription to invoices
    const subscription = args.lnd.default.subscribeInvoices({
      add_index: !!addIndex ? addIndex.toString() : undefined,
      settle_index: !!confirmedAfter ? confirmedAfter.toString() : undefined,
    });

    // Terminate subscription when all listeners are removed
    handleRemoveListener({subscription, events, emitter: eventEmitter});

    // Subscription finished callback
    const finished = err => {
      if (!!eventEmitter.listenerCount('error')) {
        eventEmitter.emit('error', err);
      }

      // Exit early when this subscription is already over
      if (!!isFinished) {
        return;
      }

      isFinished = true;

      const listenerCount = eventEmitter.listenerCount(updateEvent);

      // Exit early when there are no listeners
      if (!listenerCount) {
        return cbk(null, {listener_count: listenerCount});
      }

      // Delay restart when there are listeners
      return setTimeout(() => {
        return cbk(null, {listener_count: listenerCount});
      },
      args.restart_delay_ms || restartSubscriptionMs);
    };

    // Finish early when all listeners are removed
    eventEmitter.on('removeListener', () => {
      // Exit early when there are still active listeners
      if (!!sumOf(events.map(n => eventEmitter.listenerCount(n)))) {
        return;
      }

      return finished();
    });

    // Relay invoice updates to the emitter
    subscription.on('data', invoice => {
      try {
        const updated = rpcInvoiceAsInvoice(invoice);

        eventEmitter.emit(updateEvent, updated);

        // Update cursors for possible restart of subscription
        addIndex = updated.index;
        confirmedAfter = updated.confirmed_index;

        return;
      } catch (err) {
        return finished([503, err.message]);
      }
    });

    // Subscription finished will trigger a re-subscribe
    subscription.on('end', () => finished());

    // Subscription errors fail the subscription, trigger subscription restart
    subscription.on('error', err => {
      return finished([503, 'UnexpectedInvoiceSubscriptionError', {err}]);
    });

    // Relay status messages
    subscription.on('status', n => eventEmitter.emit('status', n));

    return;
  },
  (res, cbk) => {
    // Terminate the subscription when there are no listeners
    return cbk(null, res.listener_count === [].length);
  },
  () => eventEmitter.emit('end'));

  return eventEmitter;
};
