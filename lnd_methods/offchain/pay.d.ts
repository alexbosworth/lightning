import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type PayArgs = AuthenticatedLightningArgs<{
  /** Pay Through Specific Final Hop Public Key Hex */
  incoming_peer?: string;
  /** Maximum Additional Fee Tokens To Pay */
  max_fee?: number;
  /** Maximum Fee Millitokens to Pay */
  max_fee_mtokens?: string;
  /** Maximum Millitokens For A Multi-Path Path */
  max_path_mtokens?: string;
  /** Maximum Simultaneous Paths */
  max_paths?: number;
  /** Max CLTV Timeout */
  max_timeout_height?: number;
  messages?: {
    /** Message Type number */
    type: string;
    /** Message Raw Value Hex Encoded */
    value: string;
  }[];
  /** Millitokens to Pay */
  mtokens?: string;
  /** Pay Through Outbound Standard Channel Id */
  outgoing_channel?: string;
  /** Pay Out of Outgoing Channel Ids */
  outgoing_channels?: string[];
  path?: {
    /** Payment Hash Hex */
    id: string;
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
      /** Payment Identifier Hex */
      payment?: string;
      /** Expiration Block Height */
      timeout: number;
      /** Total Tokens To Pay */
      tokens: number;
    }[];
  };
  /** Time to Spend Finding a Route Milliseconds */
  pathfinding_timeout?: number;
  /** BOLT 11 Payment Request */
  request?: string;
  /** Total Tokens To Pay to Payment Request */
  tokens?: number;
}>;

export type PayResult = {
  /** Payment Sent At ISO 8601 Date */
  confirmed_at: string;
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
  /** Total Tokens Sent */
  tokens: number;
};

/**
 * Make a payment.
 *
 * Either a payment path or a BOLT 11 payment request is required
 *
 * For paying to private destinations along set paths, a public key in the route hops is required to form the route.
 *
 * Note: `hops` only returns the first path in the case of multiple paths
 *
 * Requires `offchain:write` permission
 *
 * `max_path_mtokens` is not supported in LND 0.12.0 or below
 *
 */
export const pay: AuthenticatedLightningMethod<PayArgs, PayResult>;
