import type { AuthenticatedLnd } from "./authenticated_lnd_grpc";
import type { UnauthenticatedLndGatewayServer } from "./unauthenticated_lnd_gateway";
export declare type AuthenticatedLndGatewayServer = UnauthenticatedLndGatewayServer & {
    /** Use Base 64 Encoded Macaroon String */
    macaroon: string;
};
/**
 * Interface to an authenticated LND gateway server.
 */
export declare function authenticatedLndGateway(server: AuthenticatedLndGatewayServer): {
    lnd: AuthenticatedLnd;
};
