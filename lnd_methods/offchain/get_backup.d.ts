import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type GetBackupArgs = AuthenticatedLightningArgs<{
  /** Funding Transaction Id Hex */
  transaction_id: string;
  /** Funding Transaction Output Index */
  transaction_vout: number;
}>;

export type GetBackupResult = {
  /** Channel Backup Hex */
  backup: string;
};

/**
 * Get the static channel backup for a channel
 *
 * Requires `offchain:read` permission
 */
export const getBackup: AuthenticatedLightningMethod<
  GetBackupArgs,
  GetBackupResult
>;
