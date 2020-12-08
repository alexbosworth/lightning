import {lndGateway as _lndGateway} from "./../lnd_gateway";
import type {AuthenticatedLnd} from "./authenticated_lnd_grpc";
import type {UnauthenticatedLndGatewayServer} from "./unauthenticated_lnd_gateway";

export type AuthenticatedLndGatewayServer = UnauthenticatedLndGatewayServer & {
  /** Use Base 64 Encoded Macaroon String */
  macaroon: string;
};

/**
 * Interface to an authenticated LND gateway server.
 */
export function authenticatedLndGateway(
  server: AuthenticatedLndGatewayServer
): {lnd: AuthenticatedLnd} {
  return _lndGateway({
    cert: server.cert,
    macaroon: server.macaroon,
    request: server.request,
    url: server.url,
    websocket: server.websocket,
  });
}
