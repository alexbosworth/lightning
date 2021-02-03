import {AuthenticatedLightningMethod} from '../../typescript';
import {AuthenticatedLnd} from '../../lnd_grpc';

export type GetBackupsResult = {
  /** All Channels Backup Hex */
  backup: string;
  channels: {
    /** Individualized Channel Backup Hex */
    backup: string;
    /** Channel Funding Transaction Id Hex */
    transaction_id: string;
    /** Channel Funding Transaction Output Index */
    transaction_vout: number;
  };
};

/**
 * Get all channel backups
 *
 * Requires `offchain:read` permission
 */
export const getBackups: AuthenticatedLightningMethod<
  {lnd: AuthenticatedLnd},
  GetBackupsResult
>;
