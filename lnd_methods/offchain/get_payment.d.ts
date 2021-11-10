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
    /** Created at ISO-8601 Date */
    created_at: string;
    /** Payment Destination Public Key Hex */
    destination: string;
    /** Total Fee Tokens To Pay */
    fee: number;
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
    paths: {
      /** Total Path Fee Tokens */
      fee: number;
      /** Total Path Fee Millitokens */
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
      /** Total Path Millitokens Paid */
      mtokens: string;
      /** MPP Payment Identifying Nonce */
      payment: string;
      /** Expiration Block Height */
      timeout: number;
      /** Path Tokens Paid */
      tokens: number;
      /** Total Millitokens Paid On All Paths */
      total_mtokens: string;
    }[]
    /** BOLT 11 Payment Request */
    request?: string;
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
  pending?: {
    /** Created at ISO-8601 Date */
    created_at: string;
    /** Payment Destination Public Key Hex */
    destination: string;
    /** Payment Hash Hex */
    id: string;
    /** Total Millitokens Pending */
    mtokens: string;
    paths: {
      /** Total Path Fee Tokens */
      fee: number;
      /** Total Path Fee Millitokens */
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
      /** Total Path Millitokens Paid */
      mtokens: string;
      /** MPP Payment Identifying Nonce */
      payment: string;
      /** Expiration Block Height */
      timeout: number;
      /** Path Tokens Paid */
      tokens: number;
      /** Total Millitokens Pending */
      total_mtokens: string;
    }[]
    /** BOLT 11 Payment Request */
    request?: string;
    /** Payment Tokens Rounded Up */
    safe_tokens: number;
    /** Payment Preimage Hex */
    secret: string;
    /** Expiration Block Height */
    timeout?: number;
    /** Total Tokens Pending */
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
