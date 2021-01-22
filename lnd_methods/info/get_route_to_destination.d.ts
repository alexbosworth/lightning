import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type GetRouteToDestinationArgs = AuthenticatedLightningArgs<{
  /** Final CLTV Delta */
  cltv_delta?: number;
  /** Final Send Destination Hex Encoded Public Key */
  destination: string;
  features?: {
    /** Feature Bit */
    bit: number;
  }[];
  ignore?: {
    /** Channel Id */
    channel?: string;
    /** Public Key Hex */
    from_public_key: string;
    /** To Public Key Hex */
    to_public_key?: string;
  }[];
  /** Incoming Peer Public Key Hex */
  incoming_peer?: string;
  /** Ignore Past Failures */
  is_ignoring_past_failures?: boolean;
  /** Maximum Fee Tokens */
  max_fee?: number;
  /** Maximum Fee Millitokens */
  max_fee_mtokens?: string;
  /** Max CLTV Timeout */
  max_timeout_height?: number;
  messages?: {
    /** Message To Final Destination Type number */
    type: string;
    /** Message To Final Destination Raw Value Hex Encoded */
    value: string;
  }[];
  /** Tokens to Send */
  mtokens?: string;
  /** Outgoing Channel Id */
  outgoing_channel?: string;
  /** Payment Identifier Hex */
  payment?: string;
  routes?: {
    /** Base Routing Fee In Millitokens */
    base_fee_mtokens?: string;
    /** Standard Format Channel Id */
    channel?: string;
    /** Channel Capacity Tokens */
    channel_capacity?: number;
    /** CLTV Delta Blocks */
    cltv_delta?: number;
    /** Fee Rate In Millitokens Per Million */
    fee_rate?: number;
    /** Forward Edge Public Key Hex */
    public_key: string;
  }[][];
  /** Starting Node Public Key Hex */
  start?: string;
  /** Tokens */
  tokens?: number;
  /** Total Millitokens of Shards */
  total_mtokens?: string;
}>;

export type GetRouteToDestinationResult = {
  route?: {
    /** Route Confidence Score Out Of One Million */
    confidence?: number;
    /** Route Fee Tokens */
    fee: number;
    /** Route Fee Millitokens */
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
      /** Forward Edge Public Key Hex */
      public_key: string;
      /** Timeout Block Height */
      timeout: number;
    }[];
    messages?: {
      /** Message Type number */
      type: string;
      /** Message Raw Value Hex Encoded */
      value: string;
    }[];
    /** Total Fee-Inclusive Millitokens */
    mtokens: string;
    /** Payment Forwarding Fee Rounded Up Tokens */
    safe_fee: number;
    /** Payment Tokens Rounded Up */
    safe_tokens: number;
    /** Route Timeout Height */
    timeout: number;
    /** Total Fee-Inclusive Tokens */
    tokens: number;
  };
};

/**
 * Get a route to a destination.
 *
 * Call this iteratively after failed route attempts to get new routes
 *
 * Requires `info:read` permission
 */
export const getRouteToDestination: AuthenticatedLightningMethod<
  GetRouteToDestinationArgs,
  GetRouteToDestinationResult
>;
