import {LndAuthentication} from './unauthenticated_lnd_grpc';

export type AuthenticatedLnd = {
  autopilot: any;
  chain: any;
  default: any;
  invoices: any;
  router: any;
  signer: any;
  tower_client: any;
  tower_server: any;
  wallet: any;
  version: any;
};

export type LndAuthenticationWithMacaroon = LndAuthentication & {
  /** Base64 or Hex Serialized Macaroon String */
  macaroon?: string;
};

/**
 * Initiate a gRPC API Methods Object for authenticated methods
 *
 * Both the `cert` and `macaroon` expect the entire serialized LND generated file
 */
export function authenticatedLndGrpc(
  auth: LndAuthenticationWithMacaroon
): {
  lnd: AuthenticatedLnd;
};
