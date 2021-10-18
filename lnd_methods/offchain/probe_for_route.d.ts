import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type ProbeForRouteArgs = AuthenticatedLightningArgs<{
  /** Final CLTV Delta Number */
  cltv_delta?: number;
  /** Destination Public Key Hex String */
  destination: string;
  features?: {
    /** Feature Bit Number */
    bit: number;
  }[];
  ignore?: {
    /** Channel Id String */
    channel?: string;
    /** Public Key Hex String */
    from_public_key: string;
    /** To Public Key Hex String */
    to_public_key?: string;
  }[];
  /** Incoming Peer Public Key Hex String */
  incoming_peer?: string;
  /** Adjust Probe For Past Routing Failures Bool */
  is_ignoring_past_failures?: boolean;
  /** Maximum Fee Tokens Number */
  max_fee?: number;
  /** Maximum Fee Millitokens to Pay String */
  max_fee_mtokens?: string;
  /** Maximum Height of Payment Timeout Number */
  max_timeout_height?: number;
  messages?: {
    /** Message To Final Destination Type Number String */
    type: string;
    /** Message To Final Destination Raw Value Hex Encoded String */
    value: string;
  }[];
  /** Millitokens to Pay String */
  mtokens?: string;
  /** Outgoing Channel Id String */
  outgoing_channel?: string;
  /** Time to Spend On A Path Milliseconds Number */
  path_timeout_ms?: number;
  /** Payment Identifier Hex String */
  payment?: string;
  /** Probe Timeout Milliseconds Number */
  probe_timeout_ms?: number;
  routes?: {
    /** Base Routing Fee In Millitokens Number */
    base_fee_mtokens?: number;
    /** Channel Capacity Tokens Number */
    channel_capacity?: number;
    /** Standard Format Channel Id String */
    channel?: string;
    /** CLTV Blocks Delta Number */
    cltv_delta?: number;
    /** Fee Rate In Millitokens Per Million Number */
    fee_rate?: number;
    /** Forward Edge Public Key Hex String */
    public_key: string;
  }[][];
  /** Tokens Number */
  tokens: number;
  /** Total Millitokens Across Paths String */
  total_mtokens?: string;
}>;

export type ProbeForRouteResult = {
  route?: {
    /** Route Confidence Score Out Of One Million Number */
    confidence?: number;
    /** Route Fee Tokens Rounded Down Number */
    fee: number;
    /** Route Fee Millitokens String */
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
      /** Forward Edge Public Key Hex String */
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
    /** Total Fee-Inclusive Millitokens String */
    mtokens: string;
    /** Payment Identifier Hex String */
    payment?: string;
    /** Payment Forwarding Fee Rounded Up Tokens Number */
    safe_fee: number;
    /** Payment Tokens Rounded Up Number */
    safe_tokens: number;
    /** Timeout Block Height Number */
    timeout: number;
    /** Total Fee-Inclusive Tokens Rounded Down Number */
    tokens: number;
    /** Total Millitokens String */
    total_mtokens?: string;
  };
};

/**
 * Probe to find a successful route
 *
 * When probing to a payment request, make sure to specify the fields encoded in the payment request such as `cltv_delta`.
 *
 * If `total_mtokens` are specified, a `payment` nonce is required.
 *
 * Requires `offchain:write` permission
 */
export const probeForRoute: AuthenticatedLightningMethod<
  ProbeForRouteArgs,
  ProbeForRouteResult
>;
