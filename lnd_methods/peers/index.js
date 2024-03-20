const addAdvertisedFeature = require('./add_advertised_feature');
const addExternalSocket = require('./add_external_socket');
const addPeer = require('./add_peer');
const getPeers = require('./get_peers');
const removeAdvertisedFeature = require('./remove_advertised_feature');
const removeExternalSocket = require('./remove_external_socket');
const removePeer = require('./remove_peer');
const subscribeToPeers = require('./subscribe_to_peers');
const updateAlias = require('./update_alias');
const updateColor = require('./update_color');

module.exports = {
  addAdvertisedFeature,
  addExternalSocket,
  addPeer,
  getPeers,
  removeAdvertisedFeature,
  removeExternalSocket,
  removePeer,
  subscribeToPeers,
  updateAlias,
  updateColor,
};
