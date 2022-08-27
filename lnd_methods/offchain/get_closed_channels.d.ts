import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type GetClosedChannelsArgs = AuthenticatedLightningArgs<{
  /** Only Return Breach Close Channels */
  is_breach_close?: boolean;
  /** Only Return Cooperative Close Channels */
  is_cooperative_close?: boolean;
  /** Only Return Funding Canceled Channels */
  is_funding_cancel?: boolean;
  /** Only Return Local Force Close Channels */
  is_local_force_close?: boolean;
  /** Only Return Remote Force Close Channels */
  is_remote_force_close?: boolean;
}>;

export type GetClosedChannelsResult = {
  channels: {
    /** Closed Channel Capacity Tokens */
    capacity: number;
    /** Channel Balance Output Spent By Tx Id */
    close_balance_spent_by?: string;
    /** Channel Balance Close Tx Output Index */
    close_balance_vout?: number;
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
    /** Channel Close Confirmation Height */
    close_confirm_height?: number;
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
  }[];
};

/**
 * Get closed out channels
 *
 * Multiple close type flags are supported.
 *
 * Requires `offchain:read` permission
 *
 * `other_ids is not supported on LND 0.15.0 and below
 */
export const getClosedChannels: AuthenticatedLightningMethod<
  GetClosedChannelsArgs,
  GetClosedChannelsResult
>;
