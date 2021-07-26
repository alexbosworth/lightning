import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type GetConnectedWatchTowersArgs = AuthenticatedLightningArgs<{
  /** Get Anchor Type Tower Info Bool */
  is_anchor?: boolean;
}>;

export type GetConnectedWatchTowersResult = {
  /** Maximum Updates Per Session Number */
  max_session_update_count: number;
  /** Sweep Tokens per Virtual Byte Number */
  sweep_tokens_per_vbyte: number;
  /** Total Backups Made Count Number */
  backups_count: number;
  /** Total Backup Failures Count Number */
  failed_backups_count: number;
  /** Finished Updated Sessions Count Number */
  finished_sessions_count: number;
  /** As Yet Unacknowledged Backup Requests Count Number */
  pending_backups_count: number;
  /** Total Backup Sessions Starts Count Number */
  sessions_count: number;
  towers: {
    /** Tower Can Be Used For New Sessions Bool */
    is_active: boolean;
    /** Identity Public Key Hex String */
    public_key: string;
    sessions: {
      /** Total Successful Backups Made Count Number */
      backups_count: number;
      /** Backups Limit Number */
      max_backups_count: number;
      /** Backups Pending Acknowledgement Count Number */
      pending_backups_count: number;
      /** Fee Rate in Tokens Per Virtual Byte Number */
      sweep_tokens_per_vbyte: number;
    }[];
    /** Tower Network Address IP:Port String */
    sockets: string[];
  }[];
};

/**
 * Get a list of connected watchtowers and watchtower info
 *
 * Includes previously connected watchtowers
 *
 * Requires LND built with `wtclientrpc` build tag
 *
 * Requires `offchain:read` permission
 *
 * `is_anchor` flag is not supported on LND 0.11.1 and below
 */
export const getConnectedWatchtowers: AuthenticatedLightningMethod<
  GetConnectedWatchTowersArgs,
  GetConnectedWatchTowersResult
>;
