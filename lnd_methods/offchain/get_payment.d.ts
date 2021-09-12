import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type GetPaymentArgs = AuthenticatedLightningArgs<{
  /** Payment Preimage Hash Hex */
  id: string;
}>;

export type GetPaymentResult = {
  failed?: {
    /** Failed Due To Lack of Balance */
    is_insufficient_balance: boolean;
    /** Failed Due to Payment Rejected At Destination */
    is_invalid_payment: boolean;
    /** Failed Due to Pathfinding Timeout */
    is_pathfinding_timeout: boolean;
    /** Failed Due to Absence of Path Through Graph */
    is_route_not_found: boolean;
  };
  /** Payment Is Settled */
  is_confirmed?: boolean;
  /** Payment Is Failed */
  is_failed?: boolean;
  /** Payment Is Pending */
  is_pending?: boolean;
  payment?: {
    /** Confirmed at ISO-8601 Date */
    confirmed_at: string;
    /** Total Fee Millitokens To Pay */
    fee_mtokens: string;
    hops: {
      /** Standard Format Channel Id */
      channel: string;
      /** Channel Capacity Tokens */
      channel_capacity: number;
      /** Routing Fee Tokens */
      fee: number;
      /** Fee Millitokens */
      fee_mtokens: string;
      /** Forwarded Tokens */
      forward: number;
      /** Forward Millitokens */
      forward_mtokens: string;
      /** Public Key Hex */
      public_key: string;
      /** Timeout Block Height */
      timeout: number;
    }[];
    /** Payment Hash Hex */
    id: string;
    /** Total Millitokens Paid */
    mtokens: string;
    /** Payment Forwarding Fee Rounded Up Tokens */
    safe_fee: number;
    /** Payment Tokens Rounded Up */
    safe_tokens: number;
    /** Payment Preimage Hex */
    secret: string;
    /** Expiration Block Height */
    timeout: number;
    /** Total Tokens Paid */
    tokens: number;
  };
};

/**
 * Get the status of a past payment
 *
 * Requires `offchain:read` permission
 */
export const getPayment: AuthenticatedLightningMethod<
  GetPaymentArgs,
  GetPaymentResult
>;
