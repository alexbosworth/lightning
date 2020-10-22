const getAutopilot = require('./get_autopilot');
const getChannel = require('./get_channel');
const getIdentity = require('./get_identity');
const getMethods = require('./get_methods');
const getNetworkCentrality = require('./get_network_centrality');
const getNetworkGraph = require('./get_network_graph');
const getNode = require('./get_node');
const getRouteToDestination = require('./get_route_to_destination');
const getWalletInfo = require('./get_wallet_info');
const getWalletVersion = require('./get_wallet_version');
const subscribeToGraph = require('./subscribe_to_graph');

module.exports = {
  getAutopilot,
  getChannel,
  getIdentity,
  getMethods,
  getNetworkCentrality,
  getNetworkGraph,
  getNode,
  getRouteToDestination,
  getWalletInfo,
  getWalletVersion,
  subscribeToGraph,
};
