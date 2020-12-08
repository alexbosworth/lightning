const EventEmitter = require('events');

const {featureFlagDetails} = require('bolt09');

const getNode = require('./get_node');
const {isLnd} = require('./../../lnd_requests');
const {rpcChannelClosedAsClosed} = require('./../../lnd_responses');
const {rpcChannelUpdateAsUpdate} = require('./../../lnd_responses');

const events = ['channel_closed', 'channel_updated', 'node_updated'];
const {isArray} = Array;
const {keys} = Object;
const method = 'subscribeChannelGraph';
const sumOf = arr => arr.reduce((sum, n) => sum + n, Number());
const type = 'default';

/** Subscribe to graph updates

  Requires `info:read` permission

  {
    lnd: <Authenticated LND API Object>
  }

  @throws
  <Error>

  @returns
  <EventEmitter Object>

  @event 'channel_closed'
  {
    [capacity]: <Channel Capacity Tokens Number>
    close_height: <Channel Close Confirmed Block Height Number>
    id: <Standard Format Channel Id String>
    [transaction_id]: <Channel Transaction Id String>
    [transaction_vout]: <Channel Transaction Output Index Number>
    updated_at: <Update Received At ISO 8601 Date String>
  }

  @event 'channel_updated'
  {
    base_fee_mtokens: <Channel Base Fee Millitokens String>
    [capacity]: <Channel Capacity Tokens Number>
    cltv_delta: <Channel CLTV Delta Number>
    fee_rate: <Channel Fee Rate In Millitokens Per Million Number>
    id: <Standard Format Channel Id String>
    is_disabled: <Channel Is Disabled Bool>
    [max_htlc_mtokens]: <Channel Maximum HTLC Millitokens String>
    min_htlc_mtokens: <Channel Minimum HTLC Millitokens String>
    public_keys: [<Announcing Public Key>, <Target Public Key String>]
    [transaction_id]: <Channel Transaction Id String>
    [transaction_vout]: <Channel Transaction Output Index Number>
    updated_at: <Update Received At ISO 8601 Date String>
  }

  @event 'error'
  <Subscription Error>

  @event 'node_updated'
  {
    alias: <Node Alias String>
    color: <Node Color String>
    features: [{
      bit: <BOLT 09 Feature Bit Number>
      is_known: <Feature is Known Bool>
      is_required: <Feature Support is Required Bool>
      type: <Feature Type String>
    }]
    public_key: <Node Public Key Hex String>
    [sockets]: [<Network Host And Port String>]
    updated_at: <Update Received At ISO 8601 Date String>
  }
*/
module.exports = ({lnd}) => {
  if (!isLnd({lnd, method, type})) {
    throw new Error('ExpectedAuthenticatedLndToSubscribeToChannelGraph');
  }

  const eventEmitter = new EventEmitter();
  const subscription = lnd[type][method]({});

  // Notify listeners of an error and cancel the subscription if it's active
  const emitError = err => {
    subscription.cancel();

    if (!eventEmitter.listenerCount('error')) {
      return;
    }

    return eventEmitter.emit('error', err);
  };

  // Cancel the subscription when all listeners are removed
  eventEmitter.on('removeListener', () => {
    const listenerCounts = events.map(n => eventEmitter.listenerCount(n));

    // Exit early when there are still listeners
    if (!!sumOf(listenerCounts)) {
      return;
    }

    subscription.cancel();

    return;
  });

  subscription.on('data', update => {
    if (!isArray(update.channel_updates)) {
      return emitError(new Error('ExpectedChannelUpdates'));
    }

    if (!isArray(update.closed_chans)) {
      return emitError(new Error('ExpectedClosedChans'));
    }

    if (!isArray(update.node_updates)) {
      return emitError(new Error('ExpectedNodeUpdates'));
    }

    // Emit channel updates
    update.channel_updates.forEach(update => {
      try {
        const channelUpdated = rpcChannelUpdateAsUpdate(update);

        return eventEmitter.emit('channel_updated', channelUpdated);
      } catch (err) {
        return emitError(err);
      }
    });

    // Emit closed channel updates
    update.closed_chans.forEach(update => {
      try {
        const channelClosed = rpcChannelClosedAsClosed(update);

        return eventEmitter.emit('channel_closed', channelClosed);
      } catch (err) {
        return emitError(err);
      }
    });

    // Emit node updates
    update.node_updates.forEach(node => {
      if (!node) {
        return emitError(new Error('ExpectedDetailsInNodeUpdateAnnouncement'));
      }

      if (!node.identity_key) {
        return emitError(new Error('ExpectedPubKeyInNodeUpdateAnnouncement'));
      }

      // LND 0.11.1 and below don't support features, but above do: exit early
      if (!!node.features && !!keys(node.features).length) {
        return eventEmitter.emit('node_updated', {
          alias: node.alias,
          color: node.color,
          features: keys(node.features).map(bit => ({
            bit: Number(bit),
            is_known: node.features[bit].is_known,
            is_required: node.features[bit].is_required,
            type: featureFlagDetails({bit: Number(bit)}).type,
          })),
          public_key: node.identity_key,
          sockets: node.addresses,
          updated_at: new Date().toISOString(),
        });
      }

      // Lookup features for LND 0.11.1 and below
      return getNode({
        lnd,
        is_omitting_channels: true,
        public_key: node.identity_key,
      },
      (err, res) => {
        if (!!err) {
          return emitError(err);
        }

        return eventEmitter.emit('node_updated', {
          alias: res.alias,
          color: res.color,
          features: res.features,
          public_key: node.identity_key,
          sockets: res.sockets.map(n => n.socket),
          updated_at: res.updated_at || new Date().toISOString(),
        });
      });
    });

    return;
  });

  subscription.on('end', () => eventEmitter.emit('end'));
  subscription.on('error', err => emitError(err));
  subscription.on('status', status => eventEmitter.emit('status', status));

  return eventEmitter;
};
