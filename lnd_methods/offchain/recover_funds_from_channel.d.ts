import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type RecoverFundsFromChannelArgs = AuthenticatedLightningArgs<{
  /** Backup Hex */
  backup: string;
}>;

/**
 * Verify and restore a channel from a single channel backup
 *
 * Requires `offchain:write` permission
 */
export const recoverFundsFromChannel: AuthenticatedLightningMethod<RecoverFundsFromChannelArgs>;
