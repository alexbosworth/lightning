import {AuthenticatedLightningSubscription} from '../../typescript';

export type SubscribeToBackupsBackupEvent = {
  /** Backup Hex */
  backup: string;
  channels: {
    /** Backup Hex */
    backup: string;
    /** Funding Transaction Id Hex */
    transaction_id: string;
    /** Funding Transaction Output Index */
    transaction_vout: number;
  }[];
};

/**
 * Subscribe to backup snapshot updates
 *
 * Requires `offchain:read` permission
 */
export const subscribeToBackups: AuthenticatedLightningSubscription;
