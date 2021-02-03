import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningSubscription,
} from '../../typescript';

export type SubscribeToPastPaymentArgs = AuthenticatedLightningArgs<{
  /** Payment Request Hash Hex */
  id: string;
}>;

export type SubscribeToPastPaymentConfirmedEvent = {
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

export type SubscribeToPastPaymentPayingEvent = {[key: string]: never};

/**
 * Subscribe to the status of a past payment
 *
 * Requires `offchain:read` permission
 */
export const subscribeToPastPayment: AuthenticatedLightningSubscription<SubscribeToPastPaymentArgs>;
