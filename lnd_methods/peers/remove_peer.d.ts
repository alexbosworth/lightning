import {AuthenticatedLndMethod} from '../../typescript/shared';

export type RemovePeerArgs = {
  /** Public Key Hex */
  public_key: string;
};

/**
 * Remove a peer if possible
 *
 * Requires `peers:remove` permission
 */
export const removePeer: AuthenticatedLndMethod<RemovePeerArgs>;
