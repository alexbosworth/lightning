import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
  LightningError,
} from '../../typescript';

export type PayViaRoutesArgs = AuthenticatedLightningArgs<{
  /** Payment Hash Hex */
  id?: string;
  /** Time to Spend Finding a Route Milliseconds */
  pathfinding_timeout?: number;
  routes: {
    /** Total Fee Tokens To Pay */
    fee: number;
    /** Total Fee Millitokens To Pay */
    fee_mtokens: string;
    hops: {
      /** Standard Format Channel Id */
      channel: string;
      /** Channel Capacity Tokens */
      channel_capacity: number;
      /** Fee */
      fee: number;
      /** Fee Millitokens */
      fee_mtokens: string;
      /** Forward Tokens */
      forward: number;
      /** Forward Millitokens */
      forward_mtokens: string;
      messages?: {
        /** Message Type number */
        type: string;
        /** Message Raw Value Hex Encoded */
        value: string;
      }[];
      /** Public Key Hex */
      public_key?: string;
      /** Timeout Block Height */
      timeout: number;
    }[];
    messages?: {
      /** Message Type number */
      type: string;
      /** Message Raw Value Hex Encoded */
      value: string;
    }[];
    /** Total Millitokens To Pay */
    mtokens: string;
    /** Expiration Block Height */
    timeout: number;
    /** Total Tokens To Pay */
    tokens: number;
  }[];
}>;

export type PayViaRoutesResult = {
  /** Payment Sent At ISO 8601 Date */
  confirmed_at: string;
  failures: LightningError[];
  /** Fee Paid Tokens */
  fee: number;
  /** Fee Paid Millitokens */
  fee_mtokens: string;
  hops: {
    /** Standard Format Channel Id */
    channel: string;
    /** Hop Channel Capacity Tokens */
    channel_capacity: number;
    /** Hop Forward Fee Millitokens */
    fee_mtokens: string;
    /** Hop Forwarded Millitokens */
    forward_mtokens: string;
    /** Hop CLTV Expiry Block Height */
    timeout: number;
  }[];
  /** Payment Hash Hex */
  id: string;
  /** Is Confirmed */
  is_confirmed: boolean;
  /** Is Outoing */
  is_outgoing: boolean;
  /** Total Millitokens Sent */
  mtokens: string;
  /** Payment Forwarding Fee Rounded Up Tokens */
  safe_fee: number;
  /** Payment Tokens Rounded Up */
  safe_tokens: number;
  /** Payment Secret Preimage Hex */
  secret: string;
  /** Total Tokens Sent Rounded Down */
  tokens: number;
};

/**
 * Make a payment via a specified route
 *
 * If no id is specified, a random id will be used to send a test payment
 *
 * Requires `offchain:write` permission
 */
export const payViaRoutes: AuthenticatedLightningMethod<
  PayViaRoutesArgs,
  PayViaRoutesResult
>;
