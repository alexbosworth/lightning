const {addPeer} = require('./peers');
const {cancelHodlInvoice} = require('./invoices');
const {cancelPendingChannel} = require('./onchain');
const {closeChannel} = require('./onchain');
const {createChainAddress} = require('./address');
const {createHodlInvoice} = require('./invoices');
const {createInvoice} = require('./invoices');
const {fundPendingChannels} = require('./onchain');
const {getAutopilot} = require('./info');
const {getBackup} = require('./offchain');
const {getChainBalance} = require('./onchain');
const {getChainFeeRate} = require('./onchain');
const {getChannel} = require('./info');
const {getChannelBalance} = require('./offchain');
const {getChannels} = require('./offchain');
const {getForwards} = require('./offchain');
const {getInvoice} = require('./invoices');
const {getNetworkCentrality} = require('./info');
const {getNetworkGraph} = require('./info');
const {getNode} = require('./info');
const {getPayment} = require('./offchain');
const {getPeers} = require('./peers');
const {getPendingChainBalance} = require('./onchain');
const {getRouteThroughHops} = require('./offchain');
const {getRouteToDestination} = require('./info');
const {getSweepTransactions} = require('./onchain');
const {getUtxos} = require('./onchain');
const {getWalletInfo} = require('./info');
const {getWalletVersion} = require('./info');
const {lockUtxo} = require('./onchain');
const {openChannel} = require('./onchain');
const {openChannels} = require('./onchain');
const {payViaPaymentDetails} = require('./offchain');
const {payViaPaymentRequest} = require('./offchain');
const {payViaRequest} = require('./offchain');
const {payViaRoutes} = require('./offchain');
const {setAutopilot} = require('./onchain');
const {settleHodlInvoice} = require('./invoices');
const {subscribeToForwardRequests} = require('./offchain');
const {subscribeToForwards} = require('./offchain');
const {subscribeToGraph} = require('./info');
const {subscribeToInvoice} = require('./invoices');
const {subscribeToInvoices} = require('./invoices');
const {subscribeToPastPayment} = require('./offchain');
const {subscribeToPayViaDetails} = require('./offchain');
const {subscribeToPayViaRequest} = require('./offchain');
const {subscribeToPayViaRoutes} = require('./offchain');
const {subscribeToProbeForRoute} = require('./offchain');
const {unlockUtxo} = require('./onchain');
const {updateChainTransaction} = require('./onchain');

module.exports = {
  addPeer,
  cancelHodlInvoice,
  cancelPendingChannel,
  closeChannel,
  createChainAddress,
  createHodlInvoice,
  createInvoice,
  fundPendingChannels,
  getAutopilot,
  getBackup,
  getChainBalance,
  getChainFeeRate,
  getChannel,
  getChannelBalance,
  getChannels,
  getForwards,
  getInvoice,
  getNetworkCentrality,
  getNetworkGraph,
  getNode,
  getPayment,
  getPeers,
  getPendingChainBalance,
  getRouteThroughHops,
  getRouteToDestination,
  getSweepTransactions,
  getUtxos,
  getWalletInfo,
  getWalletVersion,
  lockUtxo,
  openChannel,
  openChannels,
  payViaPaymentDetails,
  payViaPaymentRequest,
  payViaRequest,
  payViaRoutes,
  setAutopilot,
  settleHodlInvoice,
  subscribeToForwardRequests,
  subscribeToForwards,
  subscribeToGraph,
  subscribeToInvoice,
  subscribeToInvoices,
  subscribeToPastPayment,
  subscribeToPayViaDetails,
  subscribeToPayViaRequest,
  subscribeToPayViaRoutes,
  subscribeToProbeForRoute,
  unlockUtxo,
  updateChainTransaction,
};
