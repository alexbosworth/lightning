import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript/shared';

export type RemoveExternalSocketArgs = AuthenticatedLightningArgs<{
  /** Remove Socket Address String */
  socket: string;
}>;

/**
 * Remove an existing advertised p2p socket address
 *
 * Note: this method is not supported in LND versions 0.14.5 and below
 *
 * Requires LND built with `peersrpc` build tag
 *
 * Requires `peers:write` permissions
 */
export const removeExternalSocket: AuthenticatedLightningMethod<RemoveExternalSocketArgs>;
