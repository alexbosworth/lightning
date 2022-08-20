const EventEmitter = require('events');

const {isLnd} = require('./../../lnd_requests');
const {rpcChannelAsChannel} = require('./../../lnd_responses');
const {rpcClosedChannelAsClosed} = require('./../../lnd_responses');
const {rpcOutpointAsUpdate} = require('./../../lnd_responses');

const asError = msg => new Error(msg);
const emptyTxId = Buffer.alloc(32).toString('hex');
const eventActive = 'channel_active_changed';
const eventClosed = 'channel_closed';
const eventOpen = 'channel_opened';
const eventOpening = 'channel_opening';
const method = 'subscribeChannelEvents';
const shutDownMessage = 'Cancelled';
const sumOf = arr => arr.reduce((sum, n) => sum + n, Number());
const type = 'default';
const updateActive = 'active_channel';
const updateInactive = 'inactive_channel';
const updateClosed = 'closed_channel';
const updateOpened = 'open_channel';
const updateOpening = 'pending_open_channel';

/** Subscribe to channel updates

  Requires `offchain:read` permission

  {
    lnd: <Authenticated LND API Object>
  }

  `is_trusted_funding`, `other_ids` are not supported on LND 0.15.0 and below

  @throws
  <Error>

  @returns
  <EventEmitter Object>

  @event 'channel_active_changed'
  {
    is_active: <Channel Is Active Bool>
    transaction_id: <Channel Funding Transaction Id String>
    transaction_vout: <Channel Funding Transaction Output Index Number>
  }

  @event 'channel_closed'
  {
    capacity: <Closed Channel Capacity Tokens Number>
    [close_balance_spent_by]: <Channel Balance Output Spent By Tx Id String>
    [close_balance_vout]: <Channel Balance Close Tx Output Index Number>
    [close_confirm_height]: <Channel Close Confirmation Height Number>
    close_payments: [{
      is_outgoing: <Payment Is Outgoing Bool>
      is_paid: <Payment Is Claimed With Preimage Bool>
      is_pending: <Payment Resolution Is Pending Bool>
      is_refunded: <Payment Timed Out And Went Back To Payer Bool>
      [spent_by]: <Close Transaction Spent By Transaction Id Hex String>
      tokens: <Associated Tokens Number>
      transaction_id: <Transaction Id Hex String>
      transaction_vout: <Transaction Output Index Number>
    }]
    [close_transaction_id]: <Closing Transaction Id Hex String>
    final_local_balance: <Channel Close Final Local Balance Tokens Number>
    final_time_locked_balance: <Closed Channel Timelocked Tokens Number>
    [id]: <Closed Standard Format Channel Id String>
    is_breach_close: <Is Breach Close Bool>
    is_cooperative_close: <Is Cooperative Close Bool>
    is_funding_cancel: <Is Funding Cancelled Close Bool>
    is_local_force_close: <Is Local Force Close Bool>
    is_partner_closed: <Channel Was Closed By Channel Peer Bool>
    is_partner_initiated: <Channel Was Initiated By Channel Peer Bool>
    is_remote_force_close: <Is Remote Force Close Bool>
    other_ids: [<Other Channel Id String>]
    partner_public_key: <Partner Public Key Hex String>
    transaction_id: <Channel Funding Transaction Id Hex String>
    transaction_vout: <Channel Funding Output Index Number>
  }

  @event 'channel_opened'
  {
    capacity: <Channel Token Capacity Number>
    commit_transaction_fee: <Commit Transaction Fee Number>
    commit_transaction_weight: <Commit Transaction Weight Number>
    [cooperative_close_address]: <Coop Close Restricted to Address String>
    [cooperative_close_delay_height]: <Prevent Coop Close Until Height Number>
    id: <Standard Format Channel Id String>
    is_active: <Channel Active Bool>
    is_closing: <Channel Is Closing Bool>
    is_opening: <Channel Is Opening Bool>
    is_partner_initiated: <Channel Partner Opened Channel Bool>
    is_private: <Channel Is Private Bool>
    [is_trusted_funding]: <Funding Output is Trusted Bool>
    local_balance: <Local Balance Tokens Number>
    local_given: <Local Initially Pushed Tokens Number>
    local_reserve: <Local Reserved Tokens Number>
    partner_public_key: <Channel Partner Public Key String>
    past_states: <Total Count of Past Channel States Number>
    pending_payments: [{
      id: <Payment Preimage Hash Hex String>
      is_outgoing: <Payment Is Outgoing Bool>
      timeout: <Chain Height Expiration Number>
      tokens: <Payment Tokens Number>
    }]
    received: <Received Tokens Number>
    remote_balance: <Remote Balance Tokens Number>
    remote_given: <Remote Initially Pushed Tokens Number>
    remote_reserve: <Remote Reserved Tokens Number>
    sent: <Sent Tokens Number>
    transaction_id: <Blockchain Transaction Id String>
    transaction_vout: <Blockchain Transaction Vout Number>
    unsettled_balance: <Unsettled Balance Tokens Number>
  }

  @event 'channel_opening'
  {
    transaction_id: <Blockchain Transaction Id Hex String>
    transaction_vout: <Blockchain Transaction Output Index Number>
  }
*/
module.exports = ({lnd}) => {
  if (!isLnd({lnd, method, type})) {
    throw new Error('ExpectedAuthenticatedLndToSubscribeToChannels');
  }

  const eventEmitter = new EventEmitter();
  const subscription = lnd[type][method]({});

  // Cancel the subscription when all listeners are removed
  eventEmitter.on('removeListener', () => {
    const events = [eventActive, eventClosed, eventOpen, eventOpening];

    const listenerCounts = events.map(n => eventEmitter.listenerCount(n));

    // Exit early when there are still listeners
    if (!!sumOf(listenerCounts)) {
      return;
    }

    subscription.cancel();

    return;
  });

  const emitError = err => {
    if (err.details === shutDownMessage) {
      subscription.removeAllListeners();
    } else {
      subscription.cancel();
    }

    // Exit early when no one is listening to the error
    if (!eventEmitter.listenerCount('error')) {
      return;
    }

    return eventEmitter.emit('error', err);
  };

  subscription.on('data', update => {
    if (!update) {
      return emitError(asError('ExpectedEventDetailsInChannelSubscription'));
    }

    if (!update.type || !update.type.toLowerCase) {
      return emitError(asError('ExpectedEventTypeInChannelSubscription'));
    }

    const updateType = update.type.toLowerCase();

    const details = update[updateType];

    if (!details) {
      return emitError(asError('ExpectedEventDetailsForTypeInChannelSub'));
    }

    try {
      switch (updateType) {
      case updateActive:
        eventEmitter.emit(eventActive, {
          is_active: true,
          transaction_id: rpcOutpointAsUpdate(details).transaction_id,
          transaction_vout: rpcOutpointAsUpdate(details).transaction_vout,
        });
        break;

      case updateClosed:
        eventEmitter.emit(eventClosed, rpcClosedChannelAsClosed(details));
        break;

      case updateInactive:
        eventEmitter.emit(eventActive, {
          is_active: false,
          transaction_id: rpcOutpointAsUpdate(details).transaction_id,
          transaction_vout: rpcOutpointAsUpdate(details).transaction_vout,
        });
        break;

      case updateOpened:
        eventEmitter.emit(eventOpen, rpcChannelAsChannel(details));
        break;

      case updateOpening:
        eventEmitter.emit(eventOpening, {
          transaction_id: rpcOutpointAsUpdate(details).transaction_id,
          transaction_vout: rpcOutpointAsUpdate(details).transaction_vout,
        });
        break;

      default:
        break;
      }
    } catch (err) {
      return emitError(err);
    }

    return;
  });

  subscription.on('end', () => eventEmitter.emit('end'));
  subscription.on('error', err => emitError(err));
  subscription.on('status', status => eventEmitter.emit('status', status));

  return eventEmitter;
};
