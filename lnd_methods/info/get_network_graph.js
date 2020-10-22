const asyncAuto = require('async/auto');
const {chanFormat} = require('bolt07');
const {featureFlagDetails} = require('bolt09');
const {returnResult} = require('asyncjs-util');

const {channelEdgeAsChannel} = require('./../../lnd_responses');
const {isLnd} = require('./../../lnd_requests');
const {rpcNodeAsNode} = require('./../../lnd_responses');

const {isArray} = Array;
const {keys} = Object;
const method = 'describeGraph';
const type = 'default';

/** Get the network graph

  Requires `info:read` permission

  {
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
  {
    channels: [{
      capacity: <Channel Capacity Tokens Number>
      id: <Standard Format Channel Id String>
      policies: [{
        [base_fee_mtokens]: <Bae Fee Millitokens String>
        [cltv_delta]: <CLTV Height Delta Number>
        [fee_rate]: <Fee Rate In Millitokens Per Million Number>
        [is_disabled]: <Edge is Disabled Bool>
        [max_htlc_mtokens]: <Maximum HTLC Millitokens String>
        [min_htlc_mtokens]: <Minimum HTLC Millitokens String>
        public_key: <Public Key String>
        [updated_at]: <Last Update Epoch ISO 8601 Date String>
      }]
      transaction_id: <Funding Transaction Id String>
      transaction_vout: <Funding Transaction Output Index Number>
      [updated_at]: <Last Update Epoch ISO 8601 Date String>
    }]
    nodes: [{
      alias: <Name String>
      color: <Hex Encoded Color String>
      features: [{
        bit: <BOLT 09 Feature Bit Number>
        is_known: <Feature is Known Bool>
        is_required: <Feature Support is Required Bool>
        type: <Feature Type String>
      }]
      public_key: <Node Public Key String>
      sockets: [<Network Host:Port String>]
      updated_at: <Last Updated ISO 8601 Date String>
    }]
  }
*/
module.exports = ({lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedLndForGetNetworkGraphRequest']);
        }

        return cbk();
      },

      // Get network graph
      getGraph: ['validate', ({}, cbk) => {
        return lnd[type][method]({}, (err, networkGraph) => {
          if (!!err) {
            return cbk([503, 'GetNetworkGraphError', {err}]);
          }

          if (!networkGraph) {
            return cbk([503, 'ExpectedNetworkGraph']);
          }

          if (!isArray(networkGraph.edges)) {
            return cbk([503, 'ExpectedNetworkGraphEdges']);
          }

          if (!isArray(networkGraph.nodes)) {
            return cbk([503, 'ExpectedNetworkGraphNodes']);
          }

          return cbk(null, networkGraph);
        });
      }],

      // Derive the set of channels
      mapChannels: ['getGraph', ({getGraph}, cbk) => {
        const connected = {};

        try {
          const channels = getGraph.edges.map(edge => {
            connected[edge.node1_pub] = true;
            connected[edge.node2_pub] = true;

            return channelEdgeAsChannel(edge);
          });

          return cbk(null, {channels, connected});
        } catch (err) {
          return cbk([503, 'UnexpectedErrorParsingChannelsInGraph', {err}]);
        }
      }],

      // Derive the set of nodes
      mapNodes: ['getGraph', ({getGraph}, cbk) => {
        try {
          const nodes = getGraph.nodes
            .filter(n => !!n.last_update)
            .map(rpcNodeAsNode);

          return cbk(null, {nodes});
        } catch (err) {
          return cbk([503, 'UnexpectedErrorParsingNodesInGraph', {err}]);
        }
      }],

      // Network graph
      graph: ['mapChannels', 'mapNodes', ({mapChannels, mapNodes}, cbk) => {
        const {channels} = mapChannels;
        const {connected} = mapChannels;

        const nodes = mapNodes.nodes
          .filter(n => !!connected[n.public_key])
          .map(node => ({
            alias: node.alias,
            color: node.color,
            features: node.features,
            public_key: node.public_key,
            sockets: node.sockets.map(n => n.socket),
            updated_at: node.updated_at,
          }));

        return cbk(null, {channels, nodes});
      }],
    },
    returnResult({reject, resolve, of: 'graph'}, cbk));
  });
};
