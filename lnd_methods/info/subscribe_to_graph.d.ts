import {AuthenticatedLightningSubscription} from '../../typescript';

export type SubscribeToGraphChannelUpdatedEvent = {
  /** Channel Base Fee Millitokens */
  base_fee_mtokens: string;
  /** Channel Capacity Tokens */
  capacity: number;
  /** Channel CLTV Delta */
  cltv_delta: number;
  /** Channel Fee Rate In Millitokens Per Million */
  fee_rate: number;
  /** Standard Format Channel Id */
  id: string;
  /** Channel Is Disabled */
  is_disabled: boolean;
  /** Channel Maximum HTLC Millitokens */
  max_htlc_mtokens?: string;
  /** Channel Minimum HTLC Millitokens */
  min_htlc_mtokens: string;
  /** Announcing Public Key, Target Public Key */
  public_keys: [string, string];
  /** Channel Transaction Id */
  transaction_id: string;
  /** Channel Transaction Output Index */
  transaction_vout: number;
  /** Update Received At ISO 8601 Date */
  updated_at: string;
};

export type SubscribeToGraphChannelClosedEvent = {
  /** Channel Capacity Tokens */
  capacity?: number;
  /** Channel Close Confirmed Block Height */
  close_height: number;
  /** Standard Format Channel Id */
  id: string;
  /** Channel Transaction Id */
  transaction_id?: string;
  /** Channel Transaction Output Index */
  transaction_vout?: number;
  /** Update Received At ISO 8601 Date */
  updated_at: string;
};

export type SubscribeToGraphErrorEvent = Error;

export type SubscribeToGraphNodeUpdatedEvent = {
  /** Node Alias */
  alias: string;
  /** Node Color */
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
  /** Network Hosts And Ports */
  sockets?: string[];
  /** Update Received At ISO 8601 Date */
  updated_at: string;
};

/**
 * Subscribe to graph updates
 *
 * Requires `info:read` permission
 */
export const subscribeToGraph: AuthenticatedLightningSubscription;
