import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript/shared';

export type RemovePeerArgs = AuthenticatedLightningArgs<{
  /** Public Key Hex */
  public_key: string;
}>;

/**
 * Remove a peer if possible
 *
 * Requires `peers:remove` permission
 */
export const removePeer: AuthenticatedLightningMethod<RemovePeerArgs>;
