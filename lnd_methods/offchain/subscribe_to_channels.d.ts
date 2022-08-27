import {AuthenticatedLightningSubscription} from '../../typescript';

export type SubscribeToChannelsChannelActiveChangedEvent = {
  /** Channel Is Active */
  is_active: boolean;
  /** Channel Funding Transaction Id */
  transaction_id: string;
  /** Channel Funding Transaction Output Index */
  transaction_vout: number;
};

export type SubscribeToChannelsChannelClosedEvent = {
  /** Closed Channel Capacity Tokens */
  capacity: number;
  /** Channel Balance Output Spent By Tx Id */
  close_balance_spent_by?: string;
  /** Channel Balance Close Tx Output Index */
  close_balance_vout?: number;
  /** Channel Close Confirmation Height */
  close_confirm_height?: number;
  close_payments: {
    /** Payment Is Outgoing */
    is_outgoing: boolean;
    /** Payment Is Claimed With Preimage */
    is_paid: boolean;
    /** Payment Resolution Is Pending */
    is_pending: boolean;
    /** Payment Timed Out And Went Back To Payer */
    is_refunded: boolean;
    /** Close Transaction Spent By Transaction Id Hex */
    spent_by?: string;
    /** Associated Tokens */
    tokens: number;
    /** Transaction Id Hex */
    transaction_id: string;
    /** Transaction Output Index */
    transaction_vout: number;
  }[];
  /** Closing Transaction Id Hex */
  close_transaction_id?: string;
  /** Channel Close Final Local Balance Tokens */
  final_local_balance: number;
  /** Closed Channel Timelocked Tokens */
  final_time_locked_balance: number;
  /** Closed Standard Format Channel Id */
  id?: string;
  /** Is Breach Close */
  is_breach_close: boolean;
  /** Is Cooperative Close */
  is_cooperative_close: boolean;
  /** Is Funding Cancelled Close */
  is_funding_cancel: boolean;
  /** Is Local Force Close */
  is_local_force_close: boolean;
  /** Channel Was Closed By Channel Peer */
  is_partner_closed?: boolean;
  /** Channel Was Initiated By Channel Peer */
  is_partner_initiated?: boolean;
  /** Is Remote Force Close */
  is_remote_force_close: boolean;
  /** Other Channel Ids */
  other_ids: string[];
  /** Partner Public Key Hex */
  partner_public_key: string;
  /** Channel Funding Transaction Id Hex */
  transaction_id: string;
  /** Channel Funding Output Index */
  transaction_vout: number;
};

export type SubscribeToChannelsChannelOpenedEvent = {
  /** Channel Token Capacity */
  capacity: number;
  /** Commit Transaction Fee */
  commit_transaction_fee: number;
  /** Commit Transaction Weight */
  commit_transaction_weight: number;
  /** Coop Close Restricted to Address */
  cooperative_close_address?: string;
  /** Prevent Coop Close Until Height */
  cooperative_close_delay_height?: number;
  /** Standard Format Channel Id */
  id: string;
  /** Channel Active */
  is_active: boolean;
  /** Channel Is Closing */
  is_closing: boolean;
  /** Channel Is Opening */
  is_opening: boolean;
  /** Channel Partner Opened Channel */
  is_partner_initiated: boolean;
  /** Channel Is Private */
  is_private: boolean;
  /** Funding Output is Trusted */
  is_trusted_funding: boolean;
  /** Local Balance Tokens */
  local_balance: number;
  /** Local Initially Pushed Tokens */
  local_given?: number;
  /** Local Reserved Tokens */
  local_reserve: number;
  /** Channel Partner Public Key */
  partner_public_key: string;
  /** Total Count of Past Channel States */
  past_states: number;
  pending_payments: {
    /** Payment Preimage Hash Hex */
    id: string;
    /** Payment Is Outgoing */
    is_outgoing: boolean;
    /** Chain Height Expiration */
    timeout: number;
    /** Payment Tokens */
    tokens: number;
  }[];
  /** Received Tokens */
  received: number;
  /** Remote Balance Tokens */
  remote_balance: number;
  /** Remote Initially Pushed Tokens */
  remote_given?: number;
  /** Remote Reserved Tokens */
  remote_reserve: number;
  /** Sent Tokens */
  sent: number;
  /** Blockchain Transaction Id */
  transaction_id: string;
  /** Blockchain Transaction Vout */
  transaction_vout: number;
  /** Unsettled Balance Tokens */
  unsettled_balance: number;
};

export type SubscribeToChannelsChannelOpeningEvent = {
  /** Blockchain Transaction Id Hex */
  transaction_id: string;
  /** Blockchain Transaction Output Index */
  transaction_vout: number;
};

/**
 * Subscribe to channel updates
 *
 * Requires `offchain:read` permission
 *
 * `is_trusted_funding`, `other_ids` are not supported on LND 0.15.0 and below
 */
export const subscribeToChannels: AuthenticatedLightningSubscription;
