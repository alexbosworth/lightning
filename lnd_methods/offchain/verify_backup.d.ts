import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type VerifyBackupArgs = AuthenticatedLightningArgs<{
  /** Individual Channel Backup Hex */
  backup: string;
}>;

export type VerifyBackupResult = {
  /** LND Error */
  err?: any;
  /** Backup is Valid */
  is_valid: boolean;
};

/**
 * Verify a channel backup
 *
 * Requires `offchain:read` permission
 */
export const verifyBackup: AuthenticatedLightningMethod<
  VerifyBackupArgs,
  VerifyBackupResult
>;
