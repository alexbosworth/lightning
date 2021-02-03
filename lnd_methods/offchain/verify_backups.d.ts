import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type VerifyBackupsArgs = AuthenticatedLightningArgs<{
  /** Multi-Backup Hex */
  backup: string;
  channels: {
    /** Funding Transaction Id Hex */
    transaction_id: string;
    /** Funding Transaction Output Index */
    transaction_vout: number;
  }[];
}>;

export type VerifyBackupsResult = {
  /** Backup is Valid */
  is_valid: boolean;
};

/**
 * Verify a set of aggregated channel backup
 */
export const verifyBackups: AuthenticatedLightningMethod<
  VerifyBackupsArgs,
  VerifyBackupsResult
>;
