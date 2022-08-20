import {AuthenticatedLnd} from '../../lnd_grpc';
import {AuthenticatedLightningMethod} from '../../typescript';

export type GetNetworkGraphResult = {
  channels: {
    /** Channel Capacity Tokens */
    capacity: number;
    /** Standard Format Channel Id */
    id: string;
    policies: {
      /** Base Fee Millitokens */
      base_fee_mtokens?: string;
      /** CLTV Height Delta */
      cltv_delta?: number;
      /** Fee Rate In Millitokens Per Million */
      fee_rate?: number;
      /** Edge is Disabled */
      is_disabled?: boolean;
      /** Maximum HTLC Millitokens */
      max_htlc_mtokens?: string;
      /** Minimum HTLC Millitokens */
      min_htlc_mtokens?: string;
      /** Public Key */
      public_key: string;
      /** Last Update Epoch ISO 8601 Date */
      updated_at?: string;
    }[];
    /** Funding Transaction Id */
    transaction_id: string;
    /** Funding Transaction Output Index */
    transaction_vout: number;
    /** Last Update Epoch ISO 8601 Date */
    updated_at?: string;
  }[];
  nodes: {
    /** Name */
    alias: string;
    /** Hex Encoded Color */
    color: string;
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
    /** Node Public Key */
    public_key: string;
    /** Network Addresses and Ports */
    sockets: string[];
    /** Last Updated ISO 8601 Date */
    updated_at: string;
  }[];
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
