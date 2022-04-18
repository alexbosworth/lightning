const addPeer = require('./add_peer');
const getPeers = require('./get_peers');
const removePeer = require('./remove_peer');
const subscribeToPeers = require('./subscribe_to_peers');
const updateAlias = require('./update_alias');
const updateColor = require('./update_color');

module.exports = {
  addPeer,
  getPeers,
  removePeer,
  subscribeToPeers,
  updateAlias,
  updateColor,
};
