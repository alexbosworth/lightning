import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type GetChannelsArgs = AuthenticatedLightningArgs<{
  /** Limit Results To Only Active Channels */
  is_active?: boolean;
  /** Limit Results To Only Offline Channels */
  is_offline?: boolean;
  /** Limit Results To Only Private Channels */
  is_private?: boolean;
  /** Limit Results To Only Public Channels */
  is_public?: boolean;
  /** Only Channels With Public Key Hex */
  partner_public_key?: string;
}>;

export type GetChannelsResult = {
  channels: {
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
    is_trusted_funding?: boolean;
    /** Local Balance Tokens */
    local_balance: number;
    /** Local CSV Blocks Delay */
    local_csv?: number;
    /** Local Non-Enforceable Amount Tokens */
    local_dust?: number;
    /** Local Initially Pushed Tokens */
    local_given?: number;
    /** Local Maximum Attached HTLCs */
    local_max_htlcs?: number;
    /** Local Maximum Pending Millitokens */
    local_max_pending_mtokens?: string;
    /** Local Minimum HTLC Millitokens */
    local_min_htlc_mtokens?: string;
    /** Local Reserved Tokens */
    local_reserve: number;
    /** Other Channel Ids */
    other_ids: string[];
    /** Channel Partner Public Key */
    partner_public_key: string;
    /** Past Channel States Count */
    past_states: number;
    pending_payments: {
      /** Payment Preimage Hash Hex */
      id: string;
      /** Forward Inbound From Channel Id */
      in_channel?: string;
      /** Payment Index on Inbound Channel */
      in_payment?: number;
      /** Payment is a Forward */
      is_forward?: boolean;
      /** Payment Is Outgoing */
      is_outgoing: boolean;
      /** Forward Outbound To Channel Id */
      out_channel?: string;
      /** Payment Index on Outbound Channel */
      out_payment?: number;
      /** Payment Attempt Id */
      payment?: number;
      /** Chain Height Expiration */
      timeout: number;
      /** Payment Tokens */
      tokens: number;
    }[];
    /** Received Tokens */
    received: number;
    /** Remote Balance Tokens */
    remote_balance: number;
    /** Remote CSV Blocks Delay */
    remote_csv?: number;
    /** Remote Non-Enforceable Amount Tokens */
    remote_dust?: number;
    /** Remote Initially Pushed Tokens */
    remote_given?: number;
    /** Remote Maximum Attached HTLCs */
    remote_max_htlcs?: number;
    /** Remote Maximum Pending Millitokens */
    remote_max_pending_mtokens?: string;
    /** Remote Minimum HTLC Millitokens */
    remote_min_htlc_mtokens?: string;
    /** Remote Reserved Tokens */
    remote_reserve: number;
    /** Sent Tokens */
    sent: number;
    /** Monitoring Uptime Channel Down Milliseconds */
    time_offline?: number;
    /** Monitoring Uptime Channel Up Milliseconds */
    time_online?: number;
    /** Blockchain Transaction Id */
    transaction_id: string;
    /** Blockchain Transaction Vout */
    transaction_vout: number;
    /** Unsettled Balance Tokens */
    unsettled_balance: number;
  }[];
};

/**
 * Get channels
 * 
 * Requires `offchain:read` permission
 * 
 * `in_channel`, `in_payment`, `is_forward`, `out_channel`, `out_payment`,
`payment` are not supported on LND 0.11.1 and below
 * 
 * `is_trusted_funding` is not supported on LND 0.15.0 and below
 */
export const getChannels: AuthenticatedLightningMethod<
  GetChannelsArgs,
  GetChannelsResult
>;
