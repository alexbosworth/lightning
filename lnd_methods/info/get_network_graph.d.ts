import type {AuthenticatedLnd} from '../../lnd_grpc';
import type {
  AuthenticatedLightningMethod,
  ChannelPolicy,
} from '../../typescript';

export type GetNetworkGraphResult = {
  channels: Array<{
    /** Channel Capacity Tokens */
    capacity: number;
    /** Standard Format Channel Id */
    id: string;
    policies: ChannelPolicy[];
    /** Funding Transaction Id */
    transaction_id: string;
    /** Funding Transaction Output Index */
    transaction_vout: number;
    /** Last Update Epoch ISO 8601 Date */
    updated_at?: string;
  }>;
  nodes: Array<{
    /** Name */
    alias: string;
    /** Hex Encoded Color */
    color: string;
    features: Array<{
      /** BOLT 09 Feature Bit */
      bit: number;
      /** Feature is Known */
      is_known: boolean;
      /** Feature Support is Required */
      is_required: boolean;
      /** Feature Type */
      type: string;
    }>;
    /** Node Public Key */
    public_key: string;
    /** Network Addresses and Ports */
    sockets: string[];
    /** Last Updated ISO 8601 Date */
    updated_at: string;
  }>;
};

/**
 * Get the network graph
 *
 * Requires `info:read` permission
 */
export const getNetworkGraph: AuthenticatedLightningMethod<
  {lnd: AuthenticatedLnd},
  GetNetworkGraphResult
>;
