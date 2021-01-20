import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript/shared';

export type AddPeerArgs = AuthenticatedLightningArgs<{
  /** Add Peer as Temporary Peer, default: `false` */
  is_temporary?: boolean;
  /** Public Key Hex */
  public_key: string;
  /** Retry Count */
  retry_count?: number;
  /** Delay Retry By Milliseconds */
  retry_delay?: number;
  /** Host Network Address And Optional Port, format: ip:port */
  socket: string;
  /** Connection Attempt Timeout Milliseconds, not supported in LND 0.11.1 and below */
  timeout?: number;
}>;

/**
 * Add a peer if possible (not self, or already connected)
 *
 * Requires `peers:write` permission
 *
 * `timeout` is not supported in LND 0.11.1 and below
 */
export const addPeer: AuthenticatedLightningMethod<AddPeerArgs>;
