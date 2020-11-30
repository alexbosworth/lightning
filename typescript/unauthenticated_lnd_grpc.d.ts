export declare type LndAuthentication = {
    /** Base64 or Hex Serialized LND TLS Cert String */
    cert?: string;
    /** Host:Port String */
    socket?: string;
};
export declare type UnauthenticatedLnd = {
    unlocker: any;
};
/**
 * Unauthenticated gRPC interface to the Lightning Network Daemon (lnd).
 */
export declare function unauthenticatedLndGrpc(auth: LndAuthentication): {
    lnd: UnauthenticatedLnd;
};
