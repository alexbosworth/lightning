const {addAdvertisedFeature} = require('./peers');
const {addExternalSocket} = require('./peers');
const {addPeer} = require('./peers');
const {beginGroupSigningSession} = require('./signer');
const {broadcastChainTransaction} = require('./onchain');
const {cancelHodlInvoice} = require('./invoices');
const {cancelPendingChannel} = require('./onchain');
const {changePassword} = require('./unauthenticated');
const {closeChannel} = require('./onchain');
const {connectWatchtower} = require('./offchain');
const {createChainAddress} = require('./address');
const {createFundedPsbt} = require('./onchain');
const {createHodlInvoice} = require('./invoices');
const {createInvoice} = require('./invoices');
const {createSeed} = require('./unauthenticated');
const {createWallet} = require('./unauthenticated');
const {decodePaymentRequest} = require('./offchain');
const {deleteChainTransaction} = require('./onchain');
const {deleteFailedPayAttempts} = require('./offchain');
const {deleteFailedPayments} = require('./offchain');
const {deleteForwardingReputations} = require('./offchain');
const {deletePayment} = require('./offchain');
const {deletePayments} = require('./offchain');
const {deletePendingChannel} = require('./offchain');
const {diffieHellmanComputeSecret} = require('./signer');
const {disableChannel} = require('./offchain');
const {disconnectWatchtower} = require('./offchain');
const {enableChannel} = require('./offchain');
const {endGroupSigningSession} = require('./signer');
const {fundPendingChannels} = require('./onchain');
const {fundPsbt} = require('./onchain');
const {getAccessIds} = require('./macaroon');
const {getAutopilot} = require('./info');
const {getBackup} = require('./offchain');
const {getBackups} = require('./offchain');
const {getBlock} = require('./onchain');
const {getBlockHeader} = require('./onchain');
const {getChainAddresses} = require('./onchain');
const {getChainBalance} = require('./onchain');
const {getChainFeeEstimate} = require('./onchain');
const {getChainFeeRate} = require('./onchain');
const {getChainTransaction} = require('./onchain');
const {getChainTransactions} = require('./onchain');
const {getChannel} = require('./info');
const {getChannelBalance} = require('./offchain');
const {getChannels} = require('./offchain');
const {getClosedChannels} = require('./offchain');
const {getConfiguration} = require('./info');
const {getConnectedWatchtowers} = require('./offchain');
const {getEphemeralChannelIds} = require('./offchain');
const {getFailedPayments} = require('./offchain');
const {getFeeRates} = require('./offchain');
const {getForwardingConfidence} = require('./offchain');
const {getForwardingReputations} = require('./offchain');
const {getForwards} = require('./offchain');
const {getHeight} = require('./generic');
const {getIdentity} = require('./info');
const {getInvoice} = require('./invoices');
const {getInvoices} = require('./invoices');
const {getLockedUtxos} = require('./onchain');
const {getMasterPublicKeys} = require('./onchain');
const {getMethods} = require('./info');
const {getMinimumRelayFee} = require('./onchain');
const {getNetworkCentrality} = require('./info');
const {getNetworkGraph} = require('./info');
const {getNetworkInfo} = require('./info');
const {getNode} = require('./info');
const {getPathfindingSettings} = require('./offchain');
const {getPayment} = require('./offchain');
const {getPayments} = require('./offchain');
const {getPeers} = require('./peers');
const {getPendingChainBalance} = require('./onchain');
const {getPendingChannels} = require('./offchain');
const {getPendingPayments} = require('./offchain');
const {getPendingSweeps} = require('./onchain');
const {getPublicKey} = require('./address');
const {getRouteConfidence} = require('./generic');
const {getRouteThroughHops} = require('./offchain');
const {getRouteToDestination} = require('./info');
const {getRoutingFeeEstimate} = require('./offchain');
const {getSettlementStatus} = require('./offchain');
const {getSweepTransactions} = require('./onchain');
const {getTowerServerInfo} = require('./info');
const {getUtxos} = require('./onchain');
const {getWalletInfo} = require('./info');
const {getWalletStatus} = require('./unauthenticated');
const {getWalletVersion} = require('./info');
const {grantAccess} = require('./macaroon');
const {isDestinationPayable} = require('./offchain');
const {lockUtxo} = require('./onchain');
const {openChannel} = require('./onchain');
const {openChannels} = require('./onchain');
const {partiallySignPsbt} = require('./onchain');
const {pay} = require('./offchain');
const {payViaPaymentDetails} = require('./offchain');
const {payViaPaymentRequest} = require('./offchain');
const {payViaRequest} = require('./offchain');
const {payViaRoutes} = require('./offchain');
const {prepareForChannelProposal} = require('./onchain');
const {probeForRoute} = require('./offchain');
const {proposeChannel} = require('./onchain');
const {recoverFundsFromChannel} = require('./offchain');
const {recoverFundsFromChannels} = require('./offchain');
const {removeAdvertisedFeature} = require('./peers');
const {removeExternalSocket} = require('./peers');
const {removePeer} = require('./peers');
const {requestBatchedFeeIncrease} = require('./onchain');
const {requestChainFeeIncrease} = require('./onchain');
const {revokeAccess} = require('./macaroon');
const {sendMessageToPeer} = require('./offchain');
const {sendToChainAddress} = require('./onchain');
const {sendToChainAddresses} = require('./onchain');
const {sendToChainOutputScripts} = require('./onchain');
const {setAutopilot} = require('./onchain');
const {settleHodlInvoice} = require('./invoices');
const {signBytes} = require('./signer');
const {signChainAddressMessage} = require('./onchain');
const {signMessage} = require('./message');
const {signPsbt} = require('./onchain');
const {signTransaction} = require('./signer');
const {stopDaemon} = require('./info');
const {subscribeToBackups} = require('./offchain');
const {subscribeToBlocks} = require('./onchain');
const {subscribeToChainAddress} = require('./onchain');
const {subscribeToChainSpend} = require('./onchain');
const {subscribeToChannels} = require('./offchain');
const {subscribeToForwardRequests} = require('./offchain');
const {subscribeToForwards} = require('./offchain');
const {subscribeToGraph} = require('./info');
const {subscribeToInvoice} = require('./invoices');
const {subscribeToInvoices} = require('./invoices');
const {subscribeToOpenRequests} = require('./offchain');
const {subscribeToPastPayment} = require('./offchain');
const {subscribeToPastPayments} = require('./offchain');
const {subscribeToPayViaDetails} = require('./offchain');
const {subscribeToPayViaRequest} = require('./offchain');
const {subscribeToPayViaRoutes} = require('./offchain');
const {subscribeToPayments} = require('./offchain');
const {subscribeToPeerMessages} = require('./offchain');
const {subscribeToPeers} = require('./peers');
const {subscribeToProbeForRoute} = require('./offchain');
const {subscribeToRpcRequests} = require('./macaroon');
const {subscribeToTransactions} = require('./onchain');
const {subscribeToWalletStatus} = require('./unauthenticated');
const {unlockUtxo} = require('./onchain');
const {unlockWallet} = require('./unauthenticated');
const {updateAlias} = require('./peers');
const {updateChainTransaction} = require('./onchain');
const {updateColor} = require('./peers');
const {updateConnectedWatchtower} = require('./offchain');
const {updateGroupSigningSession} = require('./signer');
const {updatePathfindingSettings} = require('./offchain');
const {updateRoutingFees} = require('./offchain');
const {verifyAccess} = require('./macaroon');
const {verifyBackup} = require('./offchain');
const {verifyBackups} = require('./offchain');
const {verifyBytesSignature} = require('./signer');
const {verifyChainAddressMessage} = require('./onchain');
const {verifyMessage} = require('./message');

module.exports = {
  addAdvertisedFeature,
  addExternalSocket,
  addPeer,
  beginGroupSigningSession,
  broadcastChainTransaction,
  cancelHodlInvoice,
  cancelPendingChannel,
  changePassword,
  closeChannel,
  connectWatchtower,
  createChainAddress,
  createFundedPsbt,
  createHodlInvoice,
  createInvoice,
  createSeed,
  createWallet,
  decodePaymentRequest,
  deleteChainTransaction,
  deleteFailedPayAttempts,
  deleteFailedPayments,
  deleteForwardingReputations,
  deletePayment,
  deletePayments,
  deletePendingChannel,
  diffieHellmanComputeSecret,
  disableChannel,
  disconnectWatchtower,
  enableChannel,
  endGroupSigningSession,
  fundPendingChannels,
  fundPsbt,
  getAccessIds,
  getAutopilot,
  getBackup,
  getBackups,
  getBlock,
  getBlockHeader,
  getChainAddresses,
  getChainBalance,
  getChainFeeEstimate,
  getChainFeeRate,
  getChainTransaction,
  getChainTransactions,
  getChannel,
  getChannelBalance,
  getChannels,
  getClosedChannels,
  getConfiguration,
  getConnectedWatchtowers,
  getEphemeralChannelIds,
  getFailedPayments,
  getFeeRates,
  getForwardingConfidence,
  getForwardingReputations,
  getForwards,
  getHeight,
  getIdentity,
  getInvoice,
  getInvoices,
  getLockedUtxos,
  getMasterPublicKeys,
  getMethods,
  getMinimumRelayFee,
  getNetworkCentrality,
  getNetworkGraph,
  getNetworkInfo,
  getNode,
  getPathfindingSettings,
  getPayment,
  getPayments,
  getPeers,
  getPendingChainBalance,
  getPendingChannels,
  getPendingPayments,
  getPendingSweeps,
  getPublicKey,
  getRouteConfidence,
  getRouteThroughHops,
  getRouteToDestination,
  getRoutingFeeEstimate,
  getSettlementStatus,
  getSweepTransactions,
  getTowerServerInfo,
  getUtxos,
  getWalletInfo,
  getWalletStatus,
  getWalletVersion,
  grantAccess,
  isDestinationPayable,
  lockUtxo,
  openChannel,
  openChannels,
  partiallySignPsbt,
  pay,
  payViaPaymentDetails,
  payViaPaymentRequest,
  payViaRequest,
  payViaRoutes,
  prepareForChannelProposal,
  probeForRoute,
  proposeChannel,
  recoverFundsFromChannel,
  recoverFundsFromChannels,
  removeAdvertisedFeature,
  removeExternalSocket,
  removePeer,
  requestBatchedFeeIncrease,
  requestChainFeeIncrease,
  revokeAccess,
  sendMessageToPeer,
  sendToChainAddress,
  sendToChainAddresses,
  sendToChainOutputScripts,
  setAutopilot,
  settleHodlInvoice,
  signBytes,
  signChainAddressMessage,
  signMessage,
  signPsbt,
  signTransaction,
  stopDaemon,
  subscribeToBackups,
  subscribeToBlocks,
  subscribeToChainAddress,
  subscribeToChainSpend,
  subscribeToChannels,
  subscribeToForwardRequests,
  subscribeToForwards,
  subscribeToGraph,
  subscribeToInvoice,
  subscribeToInvoices,
  subscribeToOpenRequests,
  subscribeToPastPayment,
  subscribeToPastPayments,
  subscribeToPayViaDetails,
  subscribeToPayViaRequest,
  subscribeToPayViaRoutes,
  subscribeToPayments,
  subscribeToPeerMessages,
  subscribeToPeers,
  subscribeToProbeForRoute,
  subscribeToRpcRequests,
  subscribeToTransactions,
  subscribeToWalletStatus,
  unlockUtxo,
  unlockWallet,
  updateAlias,
  updateChainTransaction,
  updateColor,
  updateConnectedWatchtower,
  updateGroupSigningSession,
  updatePathfindingSettings,
  updateRoutingFees,
  verifyAccess,
  verifyBackup,
  verifyBackups,
  verifyBytesSignature,
  verifyChainAddressMessage,
  verifyMessage,
};
