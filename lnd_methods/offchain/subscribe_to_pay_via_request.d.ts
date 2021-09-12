import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningSubscription,
} from '../../typescript';

export type SubscribeToPayViaRequestArgs = AuthenticatedLightningArgs<{
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

export type SubscribeToPayViaRequestConfirmedEvent = {
  /** Confirmed at ISO-8601 Date */
  confirmed_at: string;
  /** Fee Tokens */
  fee: number;
  /** Total Fee Millitokens To Pay */
  fee_mtokens: string;
  hops: {
    /** Standard Format Channel Id */
    channel: string;
    /** Channel Capacity Tokens */
    channel_capacity: number;
    /** Fee Millitokens */
    fee_mtokens: string;
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

export type SubscribeToPayViaRequestFailedEvent = {
  /** Failed Due To Lack of Balance */
  is_insufficient_balance: boolean;
  /** Failed Due to Invalid Payment */
  is_invalid_payment: boolean;
  /** Failed Due to Pathfinding Timeout */
  is_pathfinding_timeout: boolean;
  /** Failed Due to Route Not Found */
  is_route_not_found: boolean;
  route?: {
    /** Route Total Fee Tokens Rounded Down */
    fee: number;
    /** Route Total Fee Millitokens */
    fee_mtokens: string;
    hops: {
      /** Standard Format Channel Id */
      channel: string;
      /** Channel Capacity Tokens */
      channel_capacity: number;
      /** Hop Forwarding Fee Rounded Down Tokens */
      fee: number;
      /** Hop Forwarding Fee Millitokens */
      fee_mtokens: string;
      /** Hop Forwarding Tokens Rounded Down */
      forward: number;
      /** Hop Forwarding Millitokens */
      forward_mtokens: string;
      /** Hop Sending To Public Key Hex */
      public_key: string;
      /** Hop CTLV Expiration Height */
      timeout: number;
    }[];
    /** Payment Sending Millitokens */
    mtokens: string;
    /** Payment Forwarding Fee Rounded Up Tokens */
    safe_fee: number;
    /** Payment Sending Tokens Rounded Up */
    safe_tokens: number;
    /** Payment CLTV Expiration Height */
    timeout: number;
    /** Payment Sending Tokens Rounded Down */
    tokens: number;
  };
};

export type SubscribeToPayViaRequestPayingEvent = {[key: string]: never};

/**
 * Initiate and subscribe to the outcome of a payment request
 *
 * Requires `offchain:write` permission
 *
 * `max_path_mtokens` is not supported in LND 0.12.0 or below
 *
 */
export const subscribeToPayViaRequest: AuthenticatedLightningSubscription<SubscribeToPayViaRequestArgs>;
