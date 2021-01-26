import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type AttemptRouteArgs = AuthenticatedLightningArgs<{
  /** Maximum CLTV Timeout Height Number */
  max_timeout_height: number;
  /** Path Timeout Milliseconds */
  path_timeout_ms: number;
  /** Public Key Hex String */
  public_key: string;
  route?: {
    /** Total Fee Tokens To Pay Number */
    fee: number;
    /** Total Fee Millitokens To Pay String */
    fee_mtokens: string;
    hops: {
      /** Standard Format Channel Id String */
      channel: string;
      /** Channel Capacity Tokens Number */
      channel_capacity: number;
      /** Fee Number */
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
    messages?: {
      /** Message Type Number String */
      type: string;
      /** Message Raw Value Hex Encoded String */
      value: string;
    }[];
    /** Total Millitokens To Pay String */
    mtokens: string;
    /** Payment Identifier Hex String */
    payment?: string;
    /** Expiration Block Height Number */
    timeout: number;
    /** Total Tokens To Pay Number */
    tokens: number;
    /** Total Millitokens String */
    total_mtokens?: string;
  };
}>;

/**
 * Attempt probing a route to destination
 */
export const attemptRoute: AuthenticatedLightningMethod<AttemptRouteArgs>;
