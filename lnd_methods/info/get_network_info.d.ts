import {AuthenticatedLnd} from '../../lnd_grpc';
import {AuthenticatedLightningMethod} from '../../typescript';

export type GetNetworkInfoResult = {
  /** Tokens */
  average_channel_size: number;
  /** Channels Count */
  channel_count: number;
  /** Tokens */
  max_channel_size: number;
  /** Median Channel Tokens */
  median_channel_size: number;
  /** Tokens */
  min_channel_size: number;
  /** Node Count */
  node_count: number;
  /** Channel Edge Count */
  not_recently_updated_policy_count: number;
  /** Total Capacity */
  total_capacity: number;
};

/**
 * Get network info
 *
 * Requires `info:read` permission
 */
export const getNetworkInfo: AuthenticatedLightningMethod<
  {lnd: AuthenticatedLnd},
  GetNetworkInfoResult
>;
