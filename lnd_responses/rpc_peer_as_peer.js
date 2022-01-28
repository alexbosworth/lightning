const {featureFlagDetails} = require('bolt09');

const {syncTypes} = require('./constants');

const {ceil} = Math;
const date = n => new Date(Number(BigInt(n) / BigInt(1e6))).toISOString();
const isActiveSync = n => [syncTypes.active, syncTypes.pinned].includes(n);
const isBool = n => n === false || n === true;
const isNumber = n => !isNaN(n);
const isString = n => typeof n === 'string';
const isZero = n => n === '0';
const {keys} = Object;
const microPerMilli = 1e3;

/** Translate an RPC peer into a peer

  {
    address: <Network Address String>
    bytes_recv: <Number of Bytes Received String>
    bytes_sent: <Number of Bytes Send String>
    features: {
      <Feature Bit Number String>: {
        is_known: <Feature is Known Bool>
        is_required: <Feature is Required Bool>
      }
    }
    flap_count: <Reconnection Count Number>
    inbound: <Peer Is Inbound Connection Bool>
    last_flap_ns: <Last Reconnection Time in Epoch Nanoseconds String>
    ping_time: <Peer Ping Time String>
    pub_key: <Peer Public Key Hex String>
    sat_recv: <Peer Tokens Received String>
    sat_sent: <Peer Tokens Sent String>
    sync_type: <Peer Sync Type String>
  }

  @throws
  <Error>

  @returns
  {
    bytes_received: <Bytes Received Number>
    bytes_sent: <Bytes Sent Number>
    features: [{
      bit: <BOLT 09 Feature Bit Number>
      is_known: <Feature is Known Bool>
      is_required: <Feature Support is Required Bool>
      type: <Feature Type String>
    }]
    is_inbound: <Is Inbound Peer Bool>
    [is_sync_peer]: <Is Syncing Graph Data Bool>
    [last_reconnection]: <Peer Last Reconnected At ISO 8601 Date String>
    ping_time: <Milliseconds Number>
    public_key: <Public Key String>
    [reconnection_rate]: <Count of Reconnections Over Time Number>
    socket: <Network Address And Port String>
    tokens_received: <Amount Received Tokens Number>
    tokens_sent: <Amount Sent Tokens Number>
  }
*/
module.exports = peer => {
  if (!peer) {
    throw new Error('ExpectedRpcPeerToDerivePeerDetails');
  }

  if (!isString(peer.address)) {
    throw new Error('ExpectedPeerAddressInRpcPeer');
  }

  if (!isString(peer.bytes_recv)) {
    throw new Error('ExpectedPeerBytesReceivedInRpcPeer');
  }

  if (!isString(peer.bytes_sent)) {
    throw new Error('ExpectedPeerBytesSentInRpcPeer');
  }

  if (!peer.features) {
    throw new Error('ExpectedPeerFeaturesInRpcPeer');
  }

  if (!isNumber(peer.flap_count)) {
    throw new Error('ExpectedPeerFlapCounterInRpcPeer');
  }

  if (!isBool(peer.inbound)) {
    throw new Error('ExpectedPeerInboundStatusInRpcPeer');
  }

  if (!isString(peer.last_flap_ns)) {
    throw new Error('ExpectedPeerLastFlapTimeInRpcPeer');
  }

  if (!isString(peer.ping_time)) {
    throw new Error('ExpectedPeerPingTimeInRpcPeer');
  }

  if (!isString(peer.pub_key)) {
    throw new Error('ExpectedPeerPublicKeyInRpcPeer');
  }

  if (!isString(peer.sat_recv)) {
    throw new Error('ExpectedReceiveAmountInRpcPeer');
  }

  if (!isString(peer.sat_sent)) {
    throw new Error('ExpectedSentAmountInRpcPeer');
  }

  const isPassiveSync = peer.sync_type === syncTypes.passive;
  const lastReconnected = isZero(peer.last_flap_ns) ? null : peer.last_flap_ns;

  const isKnownSyncType = isActiveSync(peer.sync_type) || isPassiveSync;

  return {
    bytes_received: Number(peer.bytes_recv),
    bytes_sent: Number(peer.bytes_sent),
    features: keys(peer.features).map(bit => ({
      bit,
      is_known: peer.features[bit].is_known,
      is_required: peer.features[bit].is_required,
      type: featureFlagDetails({bit}).type,
    })),
    is_inbound: peer.inbound,
    is_sync_peer: isKnownSyncType ? isActiveSync(peer.sync_type) : undefined,
    last_reconnection: !!lastReconnected ? date(lastReconnected) : undefined,
    ping_time: ceil(Number(peer.ping_time) / microPerMilli),
    public_key: peer.pub_key,
    reconnection_rate: !!peer.flap_count ? peer.flap_count : undefined,
    socket: peer.address,
    tokens_received: Number(peer.sat_recv),
    tokens_sent: Number(peer.sat_sent),
  };
};
