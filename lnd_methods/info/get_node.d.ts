import type {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
  ChannelPolicy,
} from '../../typescript';

export type GetNodeArgs = AuthenticatedLightningArgs<{
  /** Omit Channels from Node */
  is_omitting_channels?: boolean;
  /** Node Public Key Hex */
  public_key: string;
}>;

export type GetNodeResult = {
  /** Node Alias */
  alias: string;
  /** Node Total Capacity Tokens */
  capacity: number;
  /** Known Node Channels */
  channel_count: number;
  channels?: Array<{
    /** Maximum Tokens */
    capacity: number;
    /** Standard Format Channel Id */
    id: string;
    policies: ChannelPolicy[];
    /** Transaction Id Hex */
    transaction_id: string;
    /** Transaction Output Index */
    transaction_vout: number;
    /** Channel Last Updated At ISO 8601 Date */
    updated_at?: string;
  }>;
  /** RGB Hex Color */
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
  sockets: Array<{
    /** Host and Port */
    socket: string;
    /** Socket Type */
    type: string;
  }>;
  /** Last Known Update ISO 8601 Date */
  updated_at?: string;
};

/**
 * Get information about a node
 *
 * Requires `info:read` permission
 */
export const getNode: AuthenticatedLightningMethod<GetNodeArgs, GetNodeResult>;
