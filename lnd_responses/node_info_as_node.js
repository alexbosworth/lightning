const channelEdgeAsChannel = require('./channel_edge_as_channel');
const rpcNodeAsNode = require('./rpc_node_as_node');

const {isArray} = Array;

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
        [fee_rate]: <Fees Charged in Millitokens Per Million Number>
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

  if (args.num_channels === undefined) {
    throw new Error('ExpectedNodeDetailsChannelCount');
  }

  if (!args.total_capacity) {
    throw new Error('ExpectedTotalCapacityForNode');
  }

  const node = rpcNodeAsNode(args.node);

  return {
    alias: node.alias,
    capacity: Number(args.total_capacity),
    channel_count: args.num_channels,
    channels: (args.channels || []).map(n => channelEdgeAsChannel(n)),
    color: node.color,
    features: node.features,
    sockets: node.sockets,
    updated_at: node.updated_at,
  };
};
