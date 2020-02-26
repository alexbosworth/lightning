const {chainId} = require('./../bolt02');
const {featureFlagDetails} = require('bolt09');

const dateFromEpoch = epoch => new Date(epoch * 1e3);
const {isArray} = Array;
const isBoolean = n => n === false || n === true;
const isNumber = n => !isNaN(n);
const isString = n => typeof n === 'string';
const {keys} = Object;

/** Interpret info as wallet info

  {
    alias: <Alias String>
    best_header_timestamp: <Best Header Timestamp Epoch Seconds Number>
    block_hash: <Best Block Hash Hex String>
    block_height: <Best Block Height Number>
    chains: [{
      chain: <Chain Name String>
      network: <Network Type String>
    }]
    color: <HEX Color String>
    identity_pubkey: <Node Public Key Hex String>
    num_active_channels: <Active Channels Count Number>
    num_peers: <Total Peers Number>
    num_pending_channels: <Total Pending Channels Number>
    synced_to_chain: <Node Is Synced To Chain Bool>
    uris: [<Node URI String>]
    version: <Node Version String>
  }
*/
module.exports = args => {
  if (!args) {
    throw new Error('ExpectedWalletResponse');
  }

  if (!isString(args.alias)) {
    throw new Error('ExpectedWalletAlias');
  }

  if (!args.best_header_timestamp) {
    throw new Error('ExpectedBestHeaderTimestampInInfoResponse');
  }

  if (!isString(args.block_hash)) {
    throw new Error('ExpectedCurrentBlockHash');
  }

  if (!isNumber(args.block_height)) {
    throw new Error('ExpectedBlockHeight');
  }

  if (!isArray(args.chains)) {
    throw new Error('ExpectedChainsAssociatedWithWallet');
  }

  if (!args.color) {
    throw new Error('ExpectedWalletColorInWalletInfoResponse');
  }

  if (!args.features) {
    throw new Error('ExpectedFeaturesMapInWalletInfoResponse');
  }

  if (!args.identity_pubkey) {
    throw new Error('ExpectedIdentityPubkey');
  }

  if (!isNumber(args.num_active_channels)) {
    throw new Error('ExpectedNumActiveChannels');
  }

  if (!isNumber(args.num_peers)) {
    throw new Error('ExpectedNumPeers');
  }

  if (!isNumber(args.num_pending_channels)) {
    throw new Error('ExpectedNumPendingChannels');
  }

  if (!isBoolean(args.synced_to_chain)) {
    throw new Error('ExpectedSyncedToChainStatus');
  }

  if (!isArray(args.uris)) {
    throw new Error('ExpectedArrayOfUrisInWalletInfoResponse');
  }

  if (!isString(args.version)) {
    throw new Error('ExpectedWalletLndVersion');
  }

  return {
    chains: args.chains
      .map(({chain, network}) => chainId({chain, network}).chain)
      .filter(n => !!n),
    color: args.color,
    active_channels_count: args.num_active_channels,
    alias: args.alias,
    current_block_hash: args.block_hash,
    current_block_height: args.block_height,
    features: keys(args.features).map(bit => ({
      bit: Number(bit),
      is_known: args.features[bit].is_known,
      is_required: args.features[bit].is_required,
      type: featureFlagDetails({bit: Number(bit)}).type,
    })),
    is_synced_to_chain: args.synced_to_chain,
    is_synced_to_graph: !args.synced_to_graph ? undefined : true,
    latest_block_at: dateFromEpoch(args.best_header_timestamp).toISOString(),
    peers_count: args.num_peers,
    pending_channels_count: args.num_pending_channels,
    public_key: args.identity_pubkey,
    uris: args.uris,
    version: args.version,
  };
};
