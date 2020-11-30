import type { AuthenticatedLnd } from "./authenticated_lnd_grpc";
import type { UnauthenticatedLndGatewayServer } from "./unauthenticated_lnd_gateway";
import type { UnauthenticatedLnd } from "./unauthenticated_lnd_grpc";
export declare type LndGatewayServer = UnauthenticatedLndGatewayServer & {
    /** Use Base 64 Encoded Macaroon String */
    macaroon?: string;
};
/**
 * Interface to an LND gateway server.
 */
export declare function lndGateway(server: LndGatewayServer): {
    lnd: AuthenticatedLnd | UnauthenticatedLnd;
};
