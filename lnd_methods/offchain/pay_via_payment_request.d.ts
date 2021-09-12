import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type PayViaPaymentRequestArgs = AuthenticatedLightningArgs<{
  /** Pay Through Specific Final Hop Public Key Hex */
  incoming_peer?: string;
  /** Maximum Fee Tokens To Pay */
  max_fee?: number;
  /** Maximum Fee Millitokens to Pay */
  max_fee_mtokens?: string;
  /** Maximum Millitokens For A Multi-Path Path */
  max_path_mtokens?: string;
  /** Maximum Simultaneous Paths */
  max_paths?: number;
  /** Maximum Height of Payment Timeout */
  max_timeout_height?: number;
  messages?: {
    /** Message Type number */
    type: string;
    /** Message Raw Value Hex Encoded */
    value: string;
  }[];
  /** Millitokens to Pay */
  mtokens?: string;
  /** Pay Out of Outgoing Channel Id */
  outgoing_channel?: string;
  /** Pay Out of Outgoing Channel Ids */
  outgoing_channels?: string[];
  /** Time to Spend Finding a Route Milliseconds */
  pathfinding_timeout?: number;
  /** BOLT 11 Payment Request */
  request: string;
  /** Tokens To Pay */
  tokens?: number;
}>;

export type PayViaPaymentRequestResult = {
  /** Payment Sent At ISO 8601 Date */
  confirmed_at: string;
  /** Total Fee Tokens Paid Rounded Down */
  fee: number;
  /** Total Fee Millitokens Paid */
  fee_mtokens: string;
  hops: {
    /** First Route Standard Format Channel Id */
    channel: string;
    /** First Route Channel Capacity Tokens */
    channel_capacity: number;
    /** First Route Fee Tokens Rounded Down */
    fee: number;
    /** First Route Fee Millitokens */
    fee_mtokens: string;
    /** First Route Forward Millitokens */
    forward_mtokens: string;
    /** First Route Public Key Hex */
    public_key: string;
    /** First Route Timeout Block Height */
    timeout: number;
  }[];
  /** Payment Hash Hex */
  id: string;
  /** Total Millitokens Paid */
  mtokens: string;
  paths: {
    /** Total Fee Millitokens Paid */
    fee_mtokens: string;
    hops: {
      /** First Route Standard Format Channel Id */
      channel: string;
      /** First Route Channel Capacity Tokens */
      channel_capacity: number;
      /** First Route Fee Tokens Rounded Down */
      fee: number;
      /** First Route Fee Millitokens */
      fee_mtokens: string;
      /** First Route Forward Millitokens */
      forward_mtokens: string;
      /** First Route Public Key Hex */
      public_key: string;
      /** First Route Timeout Block Height */
      timeout: number;
    }[];
    /** Total Millitokens Paid */
    mtokens: string;
  }[];
  /** Total Fee Tokens Paid Rounded Up */
  safe_fee: number;
  /** Total Tokens Paid, Rounded Up */
  safe_tokens: number;
  /** Payment Preimage Hex */
  secret: string;
  /** Expiration Block Height */
  timeout: number;
  /** Total Tokens Paid Rounded Down */
  tokens: number;
};

/**
 * Pay via payment request
 *
 * Requires `offchain:write` permission
 *
 * `max_path_mtokens` is not supported in LND 0.12.0 or below
 *
 */
export const payViaPaymentRequest: AuthenticatedLightningMethod<
  PayViaPaymentRequestArgs,
  PayViaPaymentRequestResult
>;
