const getAutopilot = require('./get_autopilot');
const getChannel = require('./get_channel');
const getIdentity = require('./get_identity');
const getMethods = require('./get_methods');
const getNetworkCentrality = require('./get_network_centrality');
const getNetworkGraph = require('./get_network_graph');
const getNetworkInfo = require('./get_network_info');
const getNode = require('./get_node');
const getRouteToDestination = require('./get_route_to_destination');
const getTowerServerInfo = require('./get_tower_server_info');
const getWalletInfo = require('./get_wallet_info');
const getWalletVersion = require('./get_wallet_version');
const stopDaemon = require('./stop_daemon');
const subscribeToGraph = require('./subscribe_to_graph');

module.exports = {
  getAutopilot,
  getChannel,
  getIdentity,
  getMethods,
  getNetworkCentrality,
  getNetworkGraph,
  getNetworkInfo,
  getNode,
  getRouteToDestination,
  getTowerServerInfo,
  getWalletInfo,
  getWalletVersion,
  stopDaemon,
  subscribeToGraph,
};
