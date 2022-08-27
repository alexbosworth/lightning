import {AuthenticatedLightningSubscription} from '../../typescript';

export type SubscribeToOpenRequestsChannelRequestEvent = {
  /** Accept Request */
  accept: (args: {
    /** Restrict Coop Close To Address */
    cooperative_close_address?: string;
    /** Accept Funding as Trusted */
    is_trusted_funding?: boolean;
    /** Required Confirmations Before Channel Open */
    min_confirmations?: number;
    /** Peer Unilateral Balance Output CSV Delay */
    remote_csv?: number;
    /** Minimum Tokens Peer Must Keep On Their Side */
    remote_reserve?: number;
    /** Maximum Slots For Attaching HTLCs */
    remote_max_htlcs?: number;
    /** Maximum HTLCs Value Millitokens */
    remote_max_pending_mtokens?: string;
    /** Minimium HTLC Value Millitokens */
    remote_min_htlc_mtokens?: string;
  }) => void;
  /** Capacity Tokens */
  capacity: number;
  /** Chain Id Hex */
  chain: string;
  /** Commitment Transaction Fee */
  commit_fee_tokens_per_vbyte: number;
  /** CSV Delay Blocks */
  csv_delay: number;
  /** Request Id Hex */
  id: string;
  /** Incoming Channel Is Private Bool */
  is_private: boolean;
  /** Request Immediate Trusted Funding */
  is_trusted_funding: boolean;
  /** Channel Local Tokens Balance */
  local_balance: number;
  /** Channel Local Reserve Tokens */
  local_reserve: number;
  /** Maximum Millitokens Pending In Channel */
  max_pending_mtokens: string;
  /** Maximum Pending Payments */
  max_pending_payments: number;
  /** Minimum Chain Output Tokens */
  min_chain_output: number;
  /** Minimum HTLC Millitokens */
  min_htlc_mtokens: string;
  /** Peer Public Key Hex */
  partner_public_key: string;
  /** Reject Request */
  reject: (args: {
    /** 500 Character Limited Rejection Reason */
    reason?: string;
  }) => void;
};

/**
 * Subscribe to inbound channel open requests
 * 
 * Requires `offchain:write`, `onchain:write` permissions
 * 
 * Note: listening to inbound channel requests will automatically fail all
channel requests after a short delay.
 *
 * To return to default behavior of accepting all channel requests, remove all
listeners to `channel_request`
 *
 * LND 0.11.1 and below do not support `accept` or `reject` arguments
 * 
 * LND 0.15.0 and below do not support `is_trusted_funding`
 */
export const subscribeToOpenRequests: AuthenticatedLightningSubscription;
