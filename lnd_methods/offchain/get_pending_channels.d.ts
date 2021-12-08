import {AuthenticatedLightningMethod} from '../../typescript';
import {AuthenticatedLnd} from '../../lnd_grpc';

export type GetPendingChannelsResult = {
  pending_channels: {
    /** Channel Capacity Tokens */
    capacity: number;
    /** Channel Closing Transaction Id */
    close_transaction_id?: string;
    /** Channel Is Active */
    is_active: boolean;
    /** Channel Is Closing */
    is_closing: boolean;
    /** Channel Is Opening */
    is_opening: boolean;
    /** Channel Partner Initiated Channel */
    is_partner_initiated?: boolean;
    /** Channel Local Funds Constrained by Timelock */
    is_timelocked: boolean;
    /** Channel Local Tokens Balance */
    local_balance: number;
    /** Channel Local Reserved Tokens */
    local_reserve: number;
    /** Channel Peer Public Key */
    partner_public_key: string;
    /** Tokens Pending Recovery */
    pending_balance?: number;
    pending_payments?: {
      /** Payment Is Incoming */
      is_incoming: boolean;
      /** Payment Timelocked Until Height */
      timelock_height: number;
      /** Payment Tokens */
      tokens: number;
      /** Payment Transaction Id */
      transaction_id: string;
      /** Payment Transaction Vout */
      transaction_vout: number;
    }[];
    /** Tokens Received */
    received: number;
    /** Tokens Recovered From Close */
    recovered_tokens?: number;
    /** Remote Tokens Balance */
    remote_balance: number;
    /** Channel Remote Reserved Tokens */
    remote_reserve: number;
    /** Send Tokens */
    sent: number;
    /** Timelock Blocks Remaining */
    timelock_blocks?: number;
    /** Pending Tokens Block Height Timelock */
    timelock_expiration?: number;
    /** Funding Transaction Fee Tokens */
    transaction_fee?: number;
    /** Channel Funding Transaction Id */
    transaction_id: string;
    /** Channel Funding Transaction Vout */
    transaction_vout: number;
    /** Funding Transaction Weight */
    transaction_weight?: number;
  }[];
};

/**
 * Get pending channels.
 * 
 * Both `is_closing` and `is_opening` are returned as part of a channel because a
channel may be opening, closing, or active.
 * 
 * Requires `offchain:read` permission
 */
export const getPendingChannels: AuthenticatedLightningMethod<
  {lnd: AuthenticatedLnd},
  GetPendingChannelsResult
>;
