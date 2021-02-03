import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type RecoverFundsFromChannelsArgs = AuthenticatedLightningArgs<{
  /** Backup Hex */
  backup: string;
}>;

/**
 * Verify and restore channels from a multi-channel backup
 *
 * Requires `offchain:write` permission
 */
export const recoverFundsFromChannels: AuthenticatedLightningMethod<RecoverFundsFromChannelsArgs>;
