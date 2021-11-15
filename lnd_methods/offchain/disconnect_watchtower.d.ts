import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type DisconnectWatchtowerArgs = AuthenticatedLightningArgs<{
  /** Watchtower Public Key Hex String */
  public_key: string;
}>;

/**
 * Disconnect a watchtower
 *
 * Requires LND built with `wtclientrpc` build tag
 *
 * Requires `offchain:write` permission
 */
export const disconnectWatchtower: AuthenticatedLightningMethod<DisconnectWatchtowerArgs>;
