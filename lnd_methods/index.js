const {addPeer} = require('./peers');
const {broadcastChainTransaction} = require('./onchain');
const {cancelHodlInvoice} = require('./invoices');
const {cancelPendingChannel} = require('./onchain');
const {closeChannel} = require('./onchain');
const {createChainAddress} = require('./address');
const {createHodlInvoice} = require('./invoices');
const {createInvoice} = require('./invoices');
const {decodePaymentRequest} = require('./offchain');
const {deleteForwardingReputations} = require('./offchain');
const {deletePayments} = require('./offchain');
const {diffieHellmanComputeSecret} = require('./signer');
const {fundPendingChannels} = require('./onchain');
const {fundPsbt} = require('./onchain');
const {getAccessIds} = require('./macaroon');
const {getAutopilot} = require('./info');
const {getBackup} = require('./offchain');
const {getBackups} = require('./offchain');
const {getChainBalance} = require('./onchain');
const {getChainFeeEstimate} = require('./onchain');
const {getChainFeeRate} = require('./onchain');
const {getChainTransactions} = require('./onchain');
const {getChannel} = require('./info');
const {getChannelBalance} = require('./offchain');
const {getChannels} = require('./offchain');
const {getClosedChannels} = require('./offchain');
const {getFeeRates} = require('./offchain');
const {getForwards} = require('./offchain');
const {getHeight} = require('./generic');
const {getIdentity} = require('./info');
const {getInvoice} = require('./invoices');
const {getInvoices} = require('./invoices');
const {getMethods} = require('./info');
const {getNetworkCentrality} = require('./info');
const {getNetworkGraph} = require('./info');
const {getNetworkInfo} = require('./info');
const {getNode} = require('./info');
const {getPayment} = require('./offchain');
const {getPayments} = require('./offchain');
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
const {pay} = require('./offchain');
const {payViaPaymentDetails} = require('./offchain');
const {payViaPaymentRequest} = require('./offchain');
const {payViaRequest} = require('./offchain');
const {payViaRoutes} = require('./offchain');
const {prepareForChannelProposal} = require('./onchain');
const {proposeChannel} = require('./onchain');
const {recoverFundsFromChannel} = require('./offchain');
const {recoverFundsFromChannels} = require('./offchain');
const {removePeer} = require('./peers');
const {revokeAccess} = require('./macaroon');
const {sendToChainAddress} = require('./onchain');
const {sendToChainAddresses} = require('./onchain');
const {setAutopilot} = require('./onchain');
const {settleHodlInvoice} = require('./invoices');
const {signBytes} = require('./signer');
const {signMessage} = require('./message');
const {signPsbt} = require('./onchain');
const {signTransaction} = require('./signer');
const {stopDaemon} = require('./info');
const {subscribeToBackups} = require('./offchain');
const {subscribeToBlocks} = require('./onchain');
const {subscribeToChannels} = require('./offchain');
const {subscribeToForwardRequests} = require('./offchain');
const {subscribeToForwards} = require('./offchain');
const {subscribeToGraph} = require('./info');
const {subscribeToInvoice} = require('./invoices');
const {subscribeToInvoices} = require('./invoices');
const {subscribeToOpenRequests} = require('./offchain');
const {subscribeToPastPayment} = require('./offchain');
const {subscribeToPayViaDetails} = require('./offchain');
const {subscribeToPayViaRequest} = require('./offchain');
const {subscribeToPayViaRoutes} = require('./offchain');
const {subscribeToProbeForRoute} = require('./offchain');
const {unlockUtxo} = require('./onchain');
const {updateChainTransaction} = require('./onchain');
const {updateRoutingFees} = require('./offchain');
const {verifyBackup} = require('./offchain');
const {verifyBackups} = require('./offchain');
const {verifyBytesSignature} = require('./signer');
const {verifyMessage} = require('./message');

module.exports = {
  addPeer,
  broadcastChainTransaction,
  cancelHodlInvoice,
  cancelPendingChannel,
  closeChannel,
  createChainAddress,
  createHodlInvoice,
  createInvoice,
  decodePaymentRequest,
  deleteForwardingReputations,
  deletePayments,
  diffieHellmanComputeSecret,
  fundPendingChannels,
  fundPsbt,
  getAccessIds,
  getAutopilot,
  getBackup,
  getBackups,
  getChainBalance,
  getChainFeeEstimate,
  getChainFeeRate,
  getChainTransactions,
  getChannel,
  getChannelBalance,
  getChannels,
  getClosedChannels,
  getFeeRates,
  getForwards,
  getHeight,
  getIdentity,
  getInvoice,
  getInvoices,
  getMethods,
  getNetworkCentrality,
  getNetworkGraph,
  getNetworkInfo,
  getNode,
  getPayment,
  getPayments,
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
  pay,
  payViaPaymentDetails,
  payViaPaymentRequest,
  payViaRequest,
  payViaRoutes,
  prepareForChannelProposal,
  proposeChannel,
  recoverFundsFromChannel,
  recoverFundsFromChannels,
  removePeer,
  revokeAccess,
  sendToChainAddress,
  sendToChainAddresses,
  setAutopilot,
  settleHodlInvoice,
  signBytes,
  signMessage,
  signPsbt,
  signTransaction,
  stopDaemon,
  subscribeToBackups,
  subscribeToBlocks,
  subscribeToChannels,
  subscribeToForwardRequests,
  subscribeToForwards,
  subscribeToGraph,
  subscribeToInvoice,
  subscribeToInvoices,
  subscribeToOpenRequests,
  subscribeToPastPayment,
  subscribeToPayViaDetails,
  subscribeToPayViaRequest,
  subscribeToPayViaRoutes,
  subscribeToProbeForRoute,
  unlockUtxo,
  updateChainTransaction,
  updateRoutingFees,
  verifyBackup,
  verifyBackups,
  verifyBytesSignature,
  verifyMessage,
};
