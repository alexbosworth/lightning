const EventEmitter = require('events');

const {isLnd} = require('./../../lnd_requests');
const {rpcInvoiceAsInvoice} = require('./../../lnd_responses');

const isHex = n => !(n.length % 2) && /^[0-9A-F]*$/i.test(n);
const updateEvent = 'invoice_updated';

/** Subscribe to an invoice

  LND built with `invoicesrpc` tag is required

  Requires `invoices:read` permission

  `payment` is not supported on LND 0.11.1 and below

  {
    id: <Invoice Payment Preimage Hash Hex String>
    lnd: <Authenticated LND API Object>
  }

  @throws
  <Error>

  @returns
  <EventEmitter Object>

  @event `invoice_updated`
  {
    chain_address: <Fallback Chain Address String>
    [confirmed_at]: <Settled at ISO 8601 Date String>
    created_at: <ISO 8601 Date String>
    description: <Description String>
    description_hash: <Description Hash Hex String>
    expires_at: <ISO 8601 Date String>
    features: [{
      bit: <BOLT 09 Feature Bit Number>
      is_known: <Feature is Known Bool>
      is_required: <Feature Support is Required To Pay Bool>
      type: <Feature Type String>
    }]
    id: <Payment Hash String>
    [is_canceled]: <Invoice is Canceled Bool>
    is_confirmed: <Invoice is Confirmed Bool>
    [is_held]: <HTLC is Held Bool>
    is_outgoing: <Invoice is Outgoing Bool>
    is_private: <Invoice is Private Bool>
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
      timeout: <HTLC CLTV Timeout Height Number>
      tokens: <Payment Tokens Number>
      [total_mtokens]: <Total Payment Millitokens String>
    }]
    received: <Received Tokens Number>
    received_mtokens: <Received Millitokens String>
    request: <Bolt 11 Invoice String>
    routes: [[{
      base_fee_mtokens: <Base Routing Fee In Millitokens Number>
      channel: <Standard Format Channel Id String>
      cltv_delta: <CLTV Blocks Delta Number>
      fee_rate: <Fee Rate In Millitokens Per Million Number>
      public_key: <Public Key Hex String>
    }]]
    secret: <Secret Preimage Hex String>
    tokens: <Tokens Number>
  }
*/
module.exports = ({id, lnd}) => {
  if (!id || !isHex(id)) {
    throw new Error('ExpectedIdOfInvoiceToSubscribeTo');
  }

  if (!isLnd({lnd, method: 'subscribeSingleInvoice', type: 'invoices'})) {
    throw new Error('ExpectedInvoiceLndToSubscribeToSingleInvoice');
  }

  const eventEmitter = new EventEmitter();

  const subscription = lnd.invoices.subscribeSingleInvoice({
    r_hash: Buffer.from(id, 'hex'),
  });

  if (!subscription.cancel) {
    throw new Error('ExpectedCancelMethodOnSingleInvoiceSubscriptionStream');
  }

  // Cancel the subscription when all listeners are removed
  eventEmitter.on('removeListener', () => {
    // Exit early when there are still listeners
    if (eventEmitter.listenerCount('invoice_updated')) {
      return;
    }

    subscription.cancel();

    return;
  });

  const errored = err => {
    // Exit early when no listeners are attached to error
    if (!eventEmitter.listenerCount('error')) {
      return;
    }

    return eventEmitter.emit('error', err);
  };

  const invoiceUpdated = invoice => eventEmitter.emit(updateEvent, invoice);

  subscription.on('data', invoice => {
    try {
      return invoiceUpdated(rpcInvoiceAsInvoice(invoice));
    } catch (err) {
      return errored([503, err.message]);
    }
  });

  subscription.on('end', () => eventEmitter.emit('end'));
  subscription.on('error', err => errored(err));
  subscription.on('status', status => eventEmitter.emit('status', status));

  return eventEmitter;
};
