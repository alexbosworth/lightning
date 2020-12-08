import type * as request from "request";
import WebSocket = require("ws");
import {lndGateway as _lndGateway} from "../lnd_gateway";
import type {UnauthenticatedLnd} from "./unauthenticated_lnd_grpc";

export type UnauthenticatedLndGatewayServer = {
  /** Base64 or Hex Serialized Gateway TLS Cert String */
  cert?: string;
  /** Request Function */
  request: (
    options: request.Options,
    callback: request.RequestCallback
  ) => request.Request;
  /** LND Gateway URL String */
  url: string;
  /** Websocket Constructor Function */
  websocket: typeof WebSocket;
};

/**
 * Interface to an unauthenticated LND gateway server.
 */
export function unauthenticatedLndGateway(
  server: UnauthenticatedLndGatewayServer
): {lnd: UnauthenticatedLnd} {
  return _lndGateway({
    cert: server.cert,
    request: server.request,
    url: server.url,
    websocket: server.websocket,
  });
}
