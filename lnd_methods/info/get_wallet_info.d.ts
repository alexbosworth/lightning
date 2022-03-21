import {AuthenticatedLnd} from '../../lnd_grpc';
import {AuthenticatedLightningMethod} from '../../typescript';

export type GetWalletInfoResult = {
  /** Active Channels Count */
  active_channels_count: number;
  /** Node Alias */
  alias: string;
  /** Chain Id Hex */
  chains: string[];
  /** Node Color */
  color: string;
  /** Best Chain Hash Hex */
  current_block_hash: string;
  /** Best Chain Height */
  current_block_height: number;
  features: {
    /** BOLT 09 Feature Bit */
    bit: number;
    /** Feature is Known */
    is_known: boolean;
    /** Feature Support is Required */
    is_required: boolean;
    /** Feature Type */
    type: string;
  }[];
  /** Is Synced To Chain */
  is_synced_to_chain: boolean;
  /** Latest Known Block At Date */
  latest_block_at: string;
  /** Peer Count */
  peers_count: number;
  /** Pending Channels Count */
  pending_channels_count: number;
  /** Public Key */
  public_key: string;
  /** Version String */
  version: string;
};

/**
 * Get overall wallet info.
 *
 * Requires `info:read` permission
 */
export const getWalletInfo: AuthenticatedLightningMethod<
  {lnd: AuthenticatedLnd},
  GetWalletInfoResult
>;
