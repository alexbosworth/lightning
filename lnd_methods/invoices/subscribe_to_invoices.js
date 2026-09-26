const EventEmitter = require('events');

const asyncDoUntil = require('async/doUntil');

const getResumeCursors = require('./get_resume_cursors');
const {isLnd} = require('./../../lnd_requests');
const {rpcInvoiceAsInvoice} = require('./../../lnd_responses');
const subscriptionRejectionError = require('./subscription_rejection_error');

const asIndex = n => !!n ? n.toString() : undefined;
const connectionFailureMessage = 'failed to connect to all addresses';
const events = ['end', 'error', 'invoice_updated', 'status'];
const maxOf = (a, b) => Math.max(Number(a) || 0, Number(b) || 0) || undefined;
const maxRememberedSettlements = 1e4;
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
  let isResumable = !!args.added_after && !!args.confirmed_after;
  let stop;

  const emitError = err => {
    if (!!eventEmitter.listenerCount('error')) {
      eventEmitter.emit('error', err);
    }

    return;
  };

  // Cursors only move forward, and a missing value never clears a cursor
  const advance = ({add, settle}) => {
    addIndex = maxOf(addIndex, add);
    confirmedAfter = maxOf(confirmedAfter, settle);

    return;
  };

  // Recently emitted settlements, to drop repeats sent when LND catches up
  const emittedSettlements = new Set();

  const isRepeatSettlement = invoice => {
    if (!invoice.is_confirmed || !invoice.confirmed_index) {
      return false;
    }

    const key = `${invoice.id}:${invoice.confirmed_index}`;

    if (emittedSettlements.has(key)) {
      return true;
    }

    emittedSettlements.add(key);

    // Forget the oldest remembered settlement when over the limit
    if (emittedSettlements.size > maxRememberedSettlements) {
      emittedSettlements.delete(emittedSettlements.values().next().value);
    }

    return false;
  };

  // Stop when all listeners are removed (registered once, not per attempt)
  eventEmitter.on('removeListener', () => {
    // Exit early when there are still active listeners
    if (!!sumOf(events.map(n => eventEmitter.listenerCount(n)))) {
      return;
    }

    return stop();
  });

  asyncDoUntil(cbk => {
    // Safeguard the callback from being fired multiple times
    let isFinished = false;
    let restartTimer;
    let subscription;

    // Hand control back to the loop, no listener count means no listeners
    const done = listenerCount => {
      stop = () => {};

      return cbk(null, {listener_count: listenerCount || Number()});
    };

    // Fail the subscription for good, without restarting it
    const failed = err => {
      isFinished = true;

      // Make sure the old stream can't keep delivering
      if (!!subscription) {
        subscription.cancel();
      }

      // Exit early when there is no error to emit, such as on a clean end
      if (!err) {
        return done();
      }

      // End the subscription even if an error listener throws
      try {
        return emitError(err);
      } finally {
        done();
      }
    };

    // Subscription finished callback
    const finished = err => {
      // Exit early when this subscription is already over
      if (!!isFinished) {
        return;
      }

      // End the subscription when there are no listeners for invoices
      if (!eventEmitter.listenerCount(updateEvent)) {
        return failed(err);
      }

      isFinished = true;

      // Make sure the old stream can't keep delivering alongside a new one
      if (!!subscription) {
        subscription.cancel();
      }

      // Delay restart, then re-check listeners at restart time. The error is
      // not emitted: restarting is the recovery, errors are only for ending.
      restartTimer = setTimeout(() => {
        return done(eventEmitter.listenerCount(updateEvent));
      },
      args.restart_delay_ms || restartSubscriptionMs);

      return;
    };

    // Stop immediately, including while waiting to restart
    stop = () => {
      if (!!restartTimer) {
        clearTimeout(restartTimer);

        return done();
      }

      return finished();
    };

    // Start the subscription to invoices
    const subscribe = () => {
      // When both cursors are set, LND replays additions before settlements
      let isReplayingAdds = !!addIndex && !!confirmedAfter;

      try {
        subscription = args.lnd.default.subscribeInvoices({
          add_index: asIndex(addIndex),
          settle_index: asIndex(confirmedAfter),
        });
      } catch (err) {
        // e.g. the gRPC channel was closed: there is nothing to restart with
        isFinished = true;

        return process.nextTick(() => {
          return failed([503, 'FailedToSubscribeToInvoices', {err}]);
        });
      }

      // Relay invoice updates to the emitter
      subscription.on('data', invoice => {
        // Ignore data from a subscription that is already over
        if (!!isFinished) {
          return;
        }

        let updated;

        try {
          updated = rpcInvoiceAsInvoice(invoice);
        } catch (err) {
          // An invoice from LND that can't be read fails the subscription
          return failed([503, err.message]);
        }

        // Added invoices arrive in strictly increasing add-index order. An
        // older or repeated index means the added invoice backlog is over.
        if (updated.index <= addIndex) {
          isReplayingAdds = false;
        }

        // Settled invoices in the added backlog can arrive out of settle order.
        // Only the ordered settlement replay may advance the settle cursor.
        advance({
          add: updated.index,
          settle: isReplayingAdds ? undefined : updated.confirmed_index,
        });

        // An invoice added and settled while disconnected is sent twice by LND
        if (isRepeatSettlement(updated)) {
          return;
        }

        try {
          return eventEmitter.emit(updateEvent, updated);
        } catch (err) {
          // A throwing listener is not a broken stream: report, don't restart
          return emitError([503, err.message]);
        }
      });

      // Subscription finished will trigger a re-subscribe
      subscription.on('end', () => finished());

      // Subscription errors fail the subscription, trigger subscription restart
      subscription.on('error', err => {
        // Exit early when this subscription is already over
        if (!!isFinished) {
          return;
        }

        const {error} = subscriptionRejectionError({err});

        // A rejected subscription ends, trying again would be rejected again
        if (!!error) {
          return failed(error);
        }

        return finished([503, 'UnexpectedInvoiceSubscriptionError', {err}]);
      });

      // Relay status messages
      subscription.on('status', n => eventEmitter.emit('status', n));

      return;
    };

    // Subscribe directly when it is known where to resume from
    if (!!isResumable || !args.lnd.default.listInvoices) {
      return subscribe();
    }

    // Look up where to resume from before subscribing
    return getResumeCursors({lnd: args.lnd}, (err, res) => {
      // Exit early when the subscription was stopped during the lookup
      if (!!isFinished) {
        return;
      }

      // A failed lookup is tried again on the next subscription
      if (!!err) {
        return subscribe();
      }

      isResumable = true;

      // Cursors from the caller or from received invoices take priority
      addIndex = addIndex || res.add_index;
      confirmedAfter = confirmedAfter || res.settle_index;

      return subscribe();
    });
  },
  (res, cbk) => {
    // Terminate the subscription when there are no listeners
    return cbk(null, res.listener_count === [].length);
  },
  () => eventEmitter.emit('end'));

  return eventEmitter;
};
