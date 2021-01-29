import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type ConnectWatchtowerArgs = AuthenticatedLightningArgs<{
  /** Watchtower Public Key Hex String */
  public_key: string;
  /** Network Socket Address IP:PORT String */
  socket: string;
}>;

/**
 * Connect to a watchtower
 *
 * This method requires LND built with `wtclientrpc` build tag
 *
 * Requires `offchain:write` permission
 */
export const connectWatchtower: AuthenticatedLightningMethod<ConnectWatchtowerArgs>;
