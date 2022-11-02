import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript/shared';

export type AddExternalSocketArgs = AuthenticatedLightningArgs<{
  /** Add Socket Address String */
  socket: string;
}>;

/**
 * Add a new advertised p2p socket address
 *
 * Note: this method is not supported in LND versions 0.14.5 and below
 *
 * Requires LND built with `peersrpc` build tag
 *
 * Requires `peers:write` permissions
 */
export const addExternalSocket: AuthenticatedLightningMethod<AddExternalSocketArgs>;
