const backupsFromSnapshot = require('./backups_from_snapshot');
const channelAcceptAsOpenRequest = require('./channel_accept_as_open_request');
const channelEdgeAsChannel = require('./channel_edge_as_channel');
const confirmedFromPayment = require('./confirmed_from_payment');
const confirmedFromPaymentStatus = require('./confirmed_from_payment_status');
const failureFromPayment = require('./failure_from_payment');
const forwardFromHtlcEvent = require('./forward_from_htlc_event');
const htlcAsPayment = require('./htlc_as_payment');
const infoAsWalletInfo = require('./info_as_wallet_info');
const nodeInfoAsNode = require('./node_info_as_node');
const paymentFailure = require('./payment_failure');
const paymentRequestDetails = require('./payment_request_details');
const pendingAsPendingChannels = require('./pending_as_pending_channels');
const pendingFromPayment = require('./pending_from_payment');
const policyFromChannelUpdate = require('./policy_from_channel_update');
const routesFromQueryRoutes = require('./routes_from_query_routes');
const routingFailureFromHtlc = require('./routing_failure_from_htlc');
const rpcAttemptHtlcAsAttempt = require('./rpc_attempt_htlc_as_attempt');
const rpcChannelAsChannel = require('./rpc_channel_as_channel');
const rpcChannelAsOldRpcChannel = require('./rpc_channel_as_old_rpc_channel');
const rpcChannelClosedAsClosed = require('./rpc_channel_closed_as_closed');
const rpcChannelUpdateAsUpdate = require('./rpc_channel_update_as_update');
const rpcClosedChannelAsClosed = require('./rpc_closed_channel_as_closed');
const rpcConfAsConfirmation = require('./rpc_conf_as_confirmation');
const rpcFailedPolicyAsFail = require('./rpc_failed_policy_as_fail');
const rpcFeesAsChannelFees = require('./rpc_fees_as_channel_fees');
const rpcForwardAsForward = require('./rpc_forward_as_forward');
const rpcForwardAsForwardRequest = require('./rpc_forward_as_forward_request');
const rpcGroupSessionAsSession = require('./rpc_group_session_as_session');
const rpcHopAsHop = require('./rpc_hop_as_hop');
const rpcInvoiceAsInvoice = require('./rpc_invoice_as_invoice');
const rpcNetworkAsNetworkInfo = require('./rpc_network_as_network_info');
const rpcNodeAsNode = require('./rpc_node_as_node');
const rpcOutpointAsUpdate = require('./rpc_outpoint_as_update');
const rpcPaymentAsPayment = require('./rpc_payment_as_payment');
const rpcPeerAsPeer = require('./rpc_peer_as_peer');
const rpcPeerMessageAsMessage = require('./rpc_peer_message_as_message');
const rpcRequestUpdateAsEvent = require('./rpc_request_update_as_event');
const rpcResolutionAsResolution = require('./rpc_resolution_as_resolution');
const rpcRouteAsRoute = require('./rpc_route_as_route');
const rpcTxAsTransaction = require('./rpc_tx_as_transaction');
const rpcUtxoAsUtxo = require('./rpc_utxo_as_utxo');
const rpcWalletStateAsState = require('./rpc_wallet_state_as_state');

module.exports = {
  backupsFromSnapshot,
  channelAcceptAsOpenRequest,
  channelEdgeAsChannel,
  confirmedFromPayment,
  confirmedFromPaymentStatus,
  failureFromPayment,
  forwardFromHtlcEvent,
  htlcAsPayment,
  infoAsWalletInfo,
  nodeInfoAsNode,
  paymentFailure,
  paymentRequestDetails,
  pendingAsPendingChannels,
  pendingFromPayment,
  policyFromChannelUpdate,
  routesFromQueryRoutes,
  routingFailureFromHtlc,
  rpcAttemptHtlcAsAttempt,
  rpcChannelAsChannel,
  rpcChannelAsOldRpcChannel,
  rpcChannelClosedAsClosed,
  rpcChannelUpdateAsUpdate,
  rpcClosedChannelAsClosed,
  rpcConfAsConfirmation,
  rpcFailedPolicyAsFail,
  rpcFeesAsChannelFees,
  rpcForwardAsForward,
  rpcForwardAsForwardRequest,
  rpcGroupSessionAsSession,
  rpcHopAsHop,
  rpcInvoiceAsInvoice,
  rpcNetworkAsNetworkInfo,
  rpcNodeAsNode,
  rpcOutpointAsUpdate,
  rpcPaymentAsPayment,
  rpcPeerAsPeer,
  rpcPeerMessageAsMessage,
  rpcRequestUpdateAsEvent,
  rpcResolutionAsResolution,
  rpcRouteAsRoute,
  rpcTxAsTransaction,
  rpcUtxoAsUtxo,
  rpcWalletStateAsState,
};
