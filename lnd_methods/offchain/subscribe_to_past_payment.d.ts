import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningSubscription,
} from '../../typescript';

export type SubscribeToPastPaymentArgs = AuthenticatedLightningArgs<{
  /** Payment Request Hash Hex */
  id: string;
}>;

export type SubscribeToPastPaymentConfirmedEvent = {
  /** Confirmed at ISO-8601 Date */
  confirmed: string;
  /** Created at ISO-8601 Date */
  created_at: string;
  /** Payment Destination Public Key Hex */
  destination: string;
  /** Payment Forwarding Fee Rounded Down Tokens */
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
  /** Tokens Paid */
  tokens: number;
};

export type SubscribeToPastPaymentFailedEvent = {
  /** Failed Due To Lack of Balance */
  is_insufficient_balance: boolean;
  /** Failed Due to Payment Rejected At Destination */
  is_invalid_payment: boolean;
  /** Failed Due to Pathfinding Timeout */
  is_pathfinding_timeout: boolean;
  /** Failed Due to Absence of Path Through Graph */
  is_route_not_found: boolean;
};

export type SubscribeToPastPaymentPayingEvent = {
  /** Payment Created At ISO 8601 Date String */
  created_at: string;
  /** Payment Destination Hex String */
  destination: string;
  /** Payment Hash Hex String */
  id: string;
  /** Total Millitokens Pending String */
  mtokens: string;
  paths: {
    /** Total Fee Tokens Pending Number */
    fee: number;
    /** Total Fee Millitokens Pending String */
    fee_mtokens: string;
    hops: {
      /** Standard Format Channel Id String */
      channel: string;
      /** Channel Capacity Tokens Number */
      channel_capacity: number;
      /** Fee Tokens Rounded Down Number */
      fee: number;
      /** Fee Millitokens String */
      fee_mtokens: string;
      /** Forward Tokens Number */
      forward: number;
      /** Forward Millitokens String */
      forward_mtokens: string;
      /** Public Key Hex String */
      public_key: string;
      /** Timeout Block Height Number */
      timeout: number;
    }[];
    /** Total Millitokens Pending String */
    mtokens: string;
    /** Total Fee Tokens Pending Rounded Up Number */
    safe_fee: number;
    /** Total Tokens Pending, Rounded Up Number */
    safe_tokens: number;
    /** Expiration Block Height Number */
    timeout: number;
  }[];
  /** BOLT 11 Encoded Payment Request String */
  request?: string;
  /** Total Tokens Pending, Rounded Up Number */
  safe_tokens: number;
  /** Expiration Block Height Number */
  timeout?: number;
  /** Total Tokens Pending Rounded Down Number */
  tokens: number;
};

/**
 * Subscribe to the status of a past payment
 *
 * Requires `offchain:read` permission
 */
export const subscribeToPastPayment: AuthenticatedLightningSubscription<SubscribeToPastPaymentArgs>;
