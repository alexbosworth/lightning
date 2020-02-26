const {featureFlagDetails} = require('bolt09');

const channelEdgeAsChannel = require('./channel_edge_as_channel');

const colorTemplate = '#000000';
const {isArray} = Array;
const {keys} = Object;
const msPerSec = 1e3;

/** Derive node details from RPC node info

  {
    [channels]: [{
      capacity: <Capacity Tokens String>
      chan_point: <Channel Funding Outpoint String>
      channel_id: <Numeric Channel Id String>
      node1_policy: {
        disabled: <Forwarding is Disabled Bool>
        fee_base_msat: <Base Fee Tokens String>
        fee_rate_milli_msat: <Fee Rate Number String>
        last_update: <Last Update Epoch Time Seconds Number>
        max_htlc_msat: <Maximum HTLC Millitokens String>
        min_htlc: <Minimum HTLC Millitokens String>
        time_lock_delta: <CLTV Delta Number>
      }
      node1_pub: <Lexical Order First Node Public Key Hex String>
      node2_policy: {
        disabled: <Forwarding is Disabled Bool>
        fee_base_msat: <Base Fee Tokens String>
        fee_rate_milli_msat: <Fee Rate Number String>
        last_update: <Last Update Epoch Time Seconds Number>
        max_htlc_msat: <Maximum HTLC Millitokens String>
        min_htlc: <Minimum HTLC Millitokens String>
        time_lock_delta: <CLTV Delta Number>
      }
      node2_pub: <Lexical Order Second Node Public Key Hex String>
    }]
    node: {
      addresses: [{
        addr: <Socket String>
        network: <Socket Type String>
      }]
      alias: <Alias String>
      color: <RGB Hex Color String>
      features: {
        <Feature Bit Number String>: {
          is_known: <Feature Is Known Bool>
          is_required: <Feature Is Required Bool>
          name: <Feature Name String>
        }
      }
      last_update: <Last Graph Update Epoch Time Seconds Number>
      pub_key: <Node Public Key Hex String>
    }
    num_channels: <Channels Count Number>
    total_capacity: <Total Capacity Tokens Number>
  }

  @throws
  <Error>

  @returns
  {
    alias: <Node Alias String>
    capacity: <Node Total Capacity Tokens Number>
    channel_count: <Known Node Channels Number>
    channels: [{
      capacity: <Maximum Tokens Number>
      id: <Standard Format Channel Id String>
      policies: [{
        [base_fee_mtokens]: <Base Fee Millitokens String>
        [cltv_delta]: <Locktime Delta Number>
        [fee_rate]: <Fees Charged Per Million Tokens Number>
        [is_disabled]: <Channel Is Disabled Bool>
        [max_htlc_mtokens]: <Maximum HTLC Millitokens Value String>
        [min_htlc_mtokens]: <Minimum HTLC Millitokens Value String>
        public_key: <Node Public Key String>
        [updated_at]: <Policy Last Updated At ISO 8601 Date String>
      }]
      transaction_id: <Transaction Id Hex String>
      transaction_vout: <Transaction Output Index Number>
      [updated_at]: <Policy Last Updated At ISO 8601 Date String>
    }]
    color: <RGB Hex Color String>
    features: [{
      bit: <BOLT 09 Feature Bit Number>
      is_known: <Feature is Known Bool>
      is_required: <Feature Support is Required Bool>
      type: <Feature Type String>
    }]
    sockets: [{
      socket: <Host and Port String>
      type: <Socket Type String>
    }]
    [updated_at]: <Last Known Update ISO 8601 Date String>
  }
*/
module.exports = args => {
  if (!args) {
    throw new Error('ExpectedNodeDetailsToDeriveNodeInfo');
  }

  if (!args.node) {
    throw new Error('ExpectedNodeDetailsInNodeInfo');
  }

  if (!isArray(args.node.addresses)) {
    throw new Error('ExpectedArrayOfNodeAddressForNodeDetails');
  }

  args.node.addresses.forEach(({addr, network}) => {
    if (!addr) {
      throw new Error('ExpectedNodeAddressInNodeDetails');
    }

    if (!network) {
      throw new Error('ExpectedNodeNetworkInNodeDetails');
    }
  });

  if (args.node.alias === undefined) {
    throw new Error('ExpectedNodeAliasFromNodeDetails');
  }

  if (!args.node.color || args.node.color.length !== colorTemplate.length) {
    throw new Error('ExpectedNodeColorInNodeDetails');
  }

  if (!args.node.features) {
    throw new Error('ExpectedFeaturesInNodeDetails');
  }

  if (args.node.last_update === undefined) {
    throw new Error('ExpectedNodeLastUpdateTimestamp');
  }

  if (!args.node.pub_key) {
    throw new Error('ExpectedNodeDetailsPublicKey');
  }

  if (args.num_channels === undefined) {
    throw new Error('ExpectedNodeDetailsChannelCount');
  }

  if (!args.total_capacity) {
    throw new Error('ExpectedTotalCapacityForNode');
  }

  const updatedAt = args.node.last_update * msPerSec;

  const updated = !updatedAt ? undefined : new Date(updatedAt);

  return {
    alias: args.node.alias,
    capacity: Number(args.total_capacity),
    channel_count: args.num_channels,
    channels: (args.channels || []).map(n => channelEdgeAsChannel(n)),
    color: args.node.color,
    features: keys(args.node.features).map(bit => ({
      bit: Number(bit),
      is_known: args.node.features[bit].is_known,
      is_required: args.node.features[bit].is_required,
      type: featureFlagDetails({bit: Number(bit)}).type,
    })),
    sockets: args.node.addresses.map(({addr, network}) => ({
      socket: addr,
      type: network,
    })),
    updated_at: !updated ? undefined : updated.toISOString(),
  };
};
