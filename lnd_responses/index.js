const channelEdgeAsChannel = require('./channel_edge_as_channel');
const htlcAsPayment = require('./htlc_as_payment');
const infoAsWalletInfo = require('./info_as_wallet_info');
const nodeInfoAsNode = require('./node_info_as_node');
const paymentFailure = require('./payment_failure');
const policyFromChannelUpdate = require('./policy_from_channel_update');
const routesFromQueryRoutes = require('./routes_from_query_routes');
const rpcChannelAsChannel = require('./rpc_channel_as_channel');
const rpcInvoiceAsInvoice = require('./rpc_invoice_as_invoice');

module.exports = {
  channelEdgeAsChannel,
  htlcAsPayment,
  infoAsWalletInfo,
  nodeInfoAsNode,
  paymentFailure,
  policyFromChannelUpdate,
  routesFromQueryRoutes,
  rpcChannelAsChannel,
  rpcInvoiceAsInvoice,
};
