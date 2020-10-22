const {addPeer} = require('./peers');
const {cancelHodlInvoice} = require('./invoices');
const {cancelPendingChannel} = require('./onchain');
const {closeChannel} = require('./onchain');
const {createChainAddress} = require('./address');
const {createHodlInvoice} = require('./invoices');
const {createInvoice} = require('./invoices');
const {fundPendingChannels} = require('./onchain');
const {fundPsbt} = require('./onchain');
const {getAccessIds} = require('./macaroon');
const {getAutopilot} = require('./info');
const {getBackup} = require('./offchain');
const {getChainBalance} = require('./onchain');
const {getChainFeeRate} = require('./onchain');
const {getChainTransactions} = require('./onchain');
const {getChannel} = require('./info');
const {getChannelBalance} = require('./offchain');
const {getChannels} = require('./offchain');
const {getClosedChannels} = require('./offchain');
const {getForwards} = require('./offchain');
const {getIdentity} = require('./info');
const {getInvoice} = require('./invoices');
const {getMethods} = require('./info');
const {getNetworkCentrality} = require('./info');
const {getNetworkGraph} = require('./info');
const {getNode} = require('./info');
const {getPayment} = require('./offchain');
const {getPeers} = require('./peers');
const {getPendingChainBalance} = require('./onchain');
const {getPendingChannels} = require('./offchain');
const {getPublicKey} = require('./address');
const {getRouteThroughHops} = require('./offchain');
const {getRouteToDestination} = require('./info');
const {getSweepTransactions} = require('./onchain');
const {getUtxos} = require('./onchain');
const {getWalletInfo} = require('./info');
const {getWalletVersion} = require('./info');
const {grantAccess} = require('./macaroon');
const {lockUtxo} = require('./onchain');
const {openChannel} = require('./onchain');
const {openChannels} = require('./onchain');
const {payViaPaymentDetails} = require('./offchain');
const {payViaPaymentRequest} = require('./offchain');
const {payViaRequest} = require('./offchain');
const {payViaRoutes} = require('./offchain');
const {revokeAccess} = require('./macaroon');
const {setAutopilot} = require('./onchain');
const {settleHodlInvoice} = require('./invoices');
const {signPsbt} = require('./onchain');
const {subscribeToChannels} = require('./offchain');
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
  fundPsbt,
  getAccessIds,
  getAutopilot,
  getBackup,
  getChainBalance,
  getChainFeeRate,
  getChainTransactions,
  getChannel,
  getChannelBalance,
  getChannels,
  getClosedChannels,
  getForwards,
  getIdentity,
  getInvoice,
  getMethods,
  getNetworkCentrality,
  getNetworkGraph,
  getNode,
  getPayment,
  getPeers,
  getPendingChainBalance,
  getPendingChannels,
  getPublicKey,
  getRouteThroughHops,
  getRouteToDestination,
  getSweepTransactions,
  getUtxos,
  getWalletInfo,
  getWalletVersion,
  grantAccess,
  lockUtxo,
  openChannel,
  openChannels,
  payViaPaymentDetails,
  payViaPaymentRequest,
  payViaRequest,
  payViaRoutes,
  revokeAccess,
  setAutopilot,
  settleHodlInvoice,
  signPsbt,
  subscribeToChannels,
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
