const acceptRpcRequest = require('./accept_rpc_request');
const {closeChannelRequest} = require('./../../lnd_messages');
const {openChannelRequest} = require('./../../lnd_messages');
const {payViaRouteRequest} = require('./../../lnd_messages');
const rejectRpcRequest = require('./reject_rpc_request');
const {rpcRequestUpdateAsEvent} = require('./../../lnd_responses');

const isChanClose = n => !!n && n === '/lnrpc.Lightning/CloseChannel';
const isChanOpen = n => !!n && n.startsWith('/lnrpc.Lightning/OpenChannel');
const isPayViaRoute = n => !!n && n === '/routerrpc.Router/SendToRouteV2';

/** Handle an update from the RPC request stream

  {
    [is_intercepting_close_channel_requests]: <Intercept Channel Closes Bool>
    [is_intercepting_open_channel_requests]: <Is Handling Open Requests Bool>
    [is_intercepting_pay_via_routes_requests]: <Is Handling Route Reqs Bool>
    subscription: <Stream Subscription Object>
    update: {
      msg_id: <Message Id Number String>
      request_id: <Request Id Number String>
      raw_macaroon: <Raw Macaroon Buffer Object>
      custom_caveat_condition: <Custom Caveat Condition String>
      [request]: {
        method_full_uri: <Method URI String>
        serialized: <Raw Protobuf Request Buffer Object>
        stream_rpc: <Is String RPC Bool>
        type_name: <RPC Message Type String>
      }
      [response]: {
        method_full_uri: <Method URI String>
        serialized: <Raw Protobuf Response Buffer Object>
        stream_rpc: <Is String RPC Bool>
        type_name: <RPC Message Type String>
      }
      [stream_auth]: {
        method_full_uri: <Method URI String>
      }
      intercept_type: <RPC Update Type String>
    }
  }

  @throws
  <Error>

  @returns
  {
    [accept]: ({}, cbk) => {}
    data: {
      [accept]: ({}, cbk) => {}
      call: <Call Id Number>
      id: <Message Id Number>
      [macaroon]: <Base64 Encoded Macaroon String>
      [reject]: ({}, cbk) => {}
      [request]: {
        [chain_fee_tokens_per_vbyte]: <Chain Fee Tokens Per VByte Number>
        [cooperative_close_address]: <Prefer Cooperative Close Address String>
        [give_tokens]: <Tokens to Gift To Partner Number>
        [is_private]: <Channel is Private Bool>
        local_tokens: <Local Tokens Number>
        [min_confirmations]: <Spend UTXOs With Minimum Confirmations Number>
        [min_htlc_mtokens]: <Minimum HTLC Millitokens String>
        partner_public_key: <Public Key Hex String>
        [partner_csv_delay]: <Peer Output CSV Delay Number>
      }
      [uri]: <RPC URI String>
    }
    event: <Event Name String>
  }
*/
module.exports = args => {
  const details = rpcRequestUpdateAsEvent(args.update);
  const isInterceptCloseChans = !!args.is_intercepting_close_channel_requests;
  const isInterceptOpenChans = !!args.is_intercepting_open_channel_requests;
  const isInterceptPayOnRoute = !!args.is_intercepting_pay_via_routes_requests;

  const {call} = details;
  const {event} = details;
  const {id} = details;
  const {macaroon} = details;
  const {request} = args.update;
  const {subscription} = args;
  const {uri} = details;

  const accept = ({}, cbk) => acceptRpcRequest({id, subscription}, cbk);

  // Exit early when intercepting channel closes
  if (!!isInterceptCloseChans && !!request && isChanClose(uri)) {
    const req = args.lnd.default.CloseChannel.requestDeserialize(
      args.update.request.serialized
    );

    return {
      event: 'close_channel_request',
      data: {
        accept,
        id,
        macaroon,
        uri,
        reject: ({message}, cbk) => {
          return rejectRpcRequest({id, message, subscription}, cbk);
        },
        request: closeChannelRequest(req),
      },
    };
  }

  // Exit early when intercepting channel opens
  if (!!isInterceptOpenChans && !!request && isChanOpen(uri)) {
    const req = args.lnd.default.OpenChannel.requestDeserialize(
      args.update.request.serialized
    );

    return {
      event: 'open_channel_request',
      data: {
        accept,
        id,
        macaroon,
        uri,
        reject: ({message}, cbk) => {
          return rejectRpcRequest({id, message, subscription}, cbk);
        },
        request: openChannelRequest(req),
      },
    };
  }

  // Exit early when intercepting pay via route requests
  if (!!isInterceptPayOnRoute && !!request && isPayViaRoute(uri)) {
    const req = args.lnd.router.SendToRouteV2.requestDeserialize(
      args.update.request.serialized
    );

    return {
      event: 'pay_via_route_request',
      data: {
        accept,
        id,
        macaroon,
        uri,
        reject: ({message}, cbk) => {
          return rejectRpcRequest({id, message, subscription}, cbk);
        },
        request: payViaRouteRequest(req),
      },
    };
  }

  return {accept, event, data: {call, id, macaroon, uri}};
};
