import type {
  AuthenticatedLightningArgs,
  AuthenticatedLightningSubscription,
  LightningError,
} from '../../typescript';

export type SubscribeToPastPaymentsArgs = AuthenticatedLightningArgs;

export type SubscribeToPastPaymentsErrorEvent = LightningError;

export type SubscribeToPastPaymentsPaymentEvent = {
  /** Payment Confirmed At ISO 8601 Date String */
  confirmed_at: string;
  /** Created at ISO-8601 Date */
  created_at: string;
  /** Payment Destination Public Key Hex */
  destination: string;
  /** Paid Routing Fee Rounded Down Tokens Number */
  fee: number;
  /** Paid Routing Fee in Millitokens String */
  fee_mtokens: string;
  /** Payment Preimage Hash String */
  id: string;
  /** Millitokens Sent to Destination String */
  mtokens: string;
  paths: [
    {
      /** Total Fee Millitokens Paid String */
      fee_mtokens: string;
      hops: [
        {
          /** Standard Format Channel Id String */
          channel: string;
          /** Channel Capacity Tokens Number */
          channel_capacity: number;
          /** Fee Tokens Rounded Down Number */
          fee: number;
          /** Fee Millitokens String */
          fee_mtokens: string;
          /** Forward Millitokens String */
          forward_mtokens: string;
          /** Public Key Hex String */
          public_key: string;
          /** Timeout Block Height Number */
          timeout: number;
        }
      ];
      /** Total Millitokens Paid String */
      mtokens: string;
    }
  ];
  /** BOLT 11 Payment Request */
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
};

/**
 * Subscribe to successful outgoing payments
 *
 * Payments may be omitted if LND does not finalize the payment record
 *
 * Requires `offchain:read` permission
 *
 * Note: Method not supported on LND 0.13.4 and below
 */
export const subscribeToPastPayments: AuthenticatedLightningSubscription<SubscribeToPastPaymentsArgs>;
