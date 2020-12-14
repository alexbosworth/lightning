export type LndAuthentication = {
  /** Base64 or Hex Serialized LND TLS Cert String */
  cert?: string;
  /** Host:Port String */
  socket?: string;
};

export type UnauthenticatedLnd = {
  unlocker: any;
};

/**
 * Unauthenticated gRPC interface to the Lightning Network Daemon (lnd).
 */
export function unauthenticatedLndGrpc(
  auth: LndAuthentication
): {lnd: UnauthenticatedLnd};
