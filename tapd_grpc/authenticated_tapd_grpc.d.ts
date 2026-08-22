import {LndAuthenticationWithMacaroon} from "../lnd_grpc";

export type AuthenticatedTapd = {
  taprootassets: any;
};

/**
 * Initiate a gRPC API Methods Object for authenticated tapd methods
 *
 * Both the `cert` and `macaroon` expect the entire serialized tapd generated file
 */
export function authenticatedTapdGrpc(
  auth: LndAuthenticationWithMacaroon
): {
  tapd: AuthenticatedTapd;
};
