import type {
  AuthenticatedLightningArgs,
  AuthenticatedLightningSubscription,
  LightningError,
} from '../../typescript';
import type {SubscribeToPastPaymentsPaymentEvent} from './subscribe_to_past_payments';

export type SubscribeToPaymentsArgs = AuthenticatedLightningArgs;

/** A confirmed payment event
 * @event 'confirmed'
 */
export interface SubscribeToPaymentsConfirmedEvent {
  /** Payment Confirmed At ISO 8601 Date String */
  confirmed_at: string;
  /** Payment Created At ISO 8601 Date String */
  created_at: string;
  /** Payment Destination Hex String */
  destination: string;
  /** Total Fee Tokens Paid Rounded Down Number */
  fee: number;
  /** Total Fee Millitokens Paid String */
  fee_mtokens: string;
  /** Payment Hash Hex String */
  id: string;
  /** Total Millitokens Paid String */
  mtokens: string;
  /** Payment paths */
  paths?: Array<{
    /** Total Fee Tokens Paid Number */
    fee: number;
    /** Total Fee Millitokens Paid String */
    fee_mtokens: string;
    /** Hops in the path */
    hops: Array<{
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
    }>;
    /** Total Millitokens Paid String */
    mtokens: string;
    /** Total Fee Tokens Paid Rounded Up Number */
    safe_fee: number;
    /** Total Tokens Paid, Rounded Up Number */
    safe_tokens: number;
    /** Expiration Block Height Number */
    timeout: number;
  }>;
  /** BOLT 11 Encoded Payment Request String */
  request?: string;
  /** Total Fee Tokens Paid Rounded Up Number */
  safe_fee: number;
  /** Total Tokens Paid, Rounded Up Number */
  safe_tokens: number;
  /** Payment Preimage Hex String */
  secret: string;
  /** Expiration Block Height Number */
  timeout: number;
  /** Total Tokens Paid Rounded Down Number */
  tokens: number;
}

/** A failed payment event
 * @event 'failed'
 */
export interface SubscribeToPaymentsFailedEvent {
  /** Payment Hash Hex String */
  id: string;
  /** Payment Canceled Bool */
  is_canceled: boolean;
  /** Failed Due To Lack of Balance Bool */
  is_insufficient_balance: boolean;
  /** Failed Due to Payment Rejected At Destination Bool */
  is_invalid_payment: boolean;
  /** Failed Due to Pathfinding Timeout Bool */
  is_pathfinding_timeout: boolean;
  /** Failed Due to Absence of Path Through Graph Bool */
  is_route_not_found: boolean;
}

/** A paying (in-progress) payment event
 * @event 'paying'
 */
export interface SubscribeToPaymentsPayingEvent {
  /** Payment Created At ISO 8601 Date String */
  created_at: string;
  /** Payment Destination Hex String */
  destination: string;
  /** Payment Hash Hex String */
  id: string;
  /** Total Millitokens Pending String */
  mtokens: string;
  /** Payment paths */
  paths?: Array<{
    /** Total Fee Tokens Pending Number */
    fee: number;
    /** Total Fee Millitokens Pending String */
    fee_mtokens: string;
    /** Hops in the path */
    hops: Array<{
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
    }>;
    /** Total Millitokens Pending String */
    mtokens: string;
    /** Total Fee Tokens Pending Rounded Up Number */
    safe_fee: number;
    /** Total Tokens Pending, Rounded Up Number */
    safe_tokens: number;
    /** Expiration Block Height Number */
    timeout: number;
  }>;
  /** BOLT 11 Encoded Payment Request String */
  request?: string;
  /** Total Tokens Pending, Rounded Up Number */
  safe_tokens: number;
  /** Expiration Block Height Number */
  timeout?: number;
  /** Total Tokens Pending Rounded Down Number */
  tokens: number;
}

/**
 * Subscribe to outgoing payments
 *
 * Requires `offchain:read` permission
 *
 * Note: Method not supported on LND 0.15.5 and below
 */
export const subscribeToPayments: AuthenticatedLightningSubscription<SubscribeToPaymentsArgs>;
