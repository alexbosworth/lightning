import type * as request from "request";
import WebSocket = require("ws");
import type { UnauthenticatedLnd } from "./unauthenticated_lnd_grpc";
export declare type UnauthenticatedLndGatewayServer = {
    /** Base64 or Hex Serialized Gateway TLS Cert String */
    cert?: string;
    /** Request Function */
    request: (options: request.Options, callback: request.RequestCallback) => request.Request;
    /** LND Gateway URL String */
    url: string;
    /** Websocket Constructor Function */
    websocket: typeof WebSocket;
};
/**
 * Interface to an unauthenticated LND gateway server.
 */
export declare function unauthenticatedLndGateway(server: UnauthenticatedLndGatewayServer): {
    lnd: UnauthenticatedLnd;
};
