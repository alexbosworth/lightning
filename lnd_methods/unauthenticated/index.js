const changePassword = require('./change_password');
const createSeed = require('./create_seed');
const createWallet = require('./create_wallet');
const getWalletStatus = require('./get_wallet_status');
const subscribeToWalletStatus = require('./subscribe_to_wallet_status');
const unlockWallet = require('./unlock_wallet');

module.exports = {
  changePassword,
  createSeed,
  createWallet,
  getWalletStatus,
  subscribeToWalletStatus,
  unlockWallet,
};
