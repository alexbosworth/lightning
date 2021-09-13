import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningSubscription,
  LightningError,
} from '../../typescript';

export type SubscribeToProbeForRouteArgs = AuthenticatedLightningArgs<{
  /** Final CLTV Delta */
  cltv_delta?: number;
  /** Destination Public Key Hex */
  destination: string;
  features?: {
    /** Feature Bit */
    bit: number;
  }[];
  ignore?: {
    /** Public Key Hex */
    from_public_key: string;
    /** To Public Key Hex */
    to_public_key?: string;
  }[];
  /** Incoming Peer Public Key Hex */
  incoming_peer?: string;
  /** Maximum Fee Tokens */
  max_fee?: number;
  /** Maximum Fee Millitokens to Probe */
  max_fee_mtokens?: string;
  /** Maximum CLTV Timeout Height */
  max_timeout_height?: number;
  messages?: {
    /** Message To Final Destination Type number */
    type: string;
    /** Message To Final Destination Raw Value Hex Encoded */
    value: string;
  }[];
  /** Millitokens to Probe */
  mtokens?: string;
  /** Outgoing Channel Id */
  outgoing_channel?: string;
  /** Skip Individual Path Attempt After Milliseconds */
  path_timeout_ms?: number;
  /** Payment Identifier Hex */
  payment?: string;
  /** Fail Entire Probe After Milliseconds */
  probe_timeout_ms?: number;
  routes?: {
    /** Base Routing Fee In Millitokens */
    base_fee_mtokens?: string;
    /** Channel Capacity Tokens */
    channel_capacity?: number;
    /** Standard Format Channel Id */
    channel?: string;
    /** CLTV Blocks Delta */
    cltv_delta?: number;
    /** Fee Rate In Millitokens Per Million */
    fee_rate?: number;
    /** Forward Edge Public Key Hex */
    public_key: string;
  }[][];
  /** Tokens to Probe */
  tokens?: number;
  /** Total Millitokens Across Paths */
  total_mtokens?: string;
}>;

export type SubscribeToProbeForRouteErrorEvent = LightningError<undefined>;

export type SubscribeToProbeForRouteProbeSuccessEvent = {
  route: {
    /** Route Confidence Score Out Of One Million */
    confidence?: number;
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
    /** Total Millitokens To Pay */
    mtokens: string;
    /** Payment Identifier Hex */
    payment?: string;
    /** Payment Forwarding Fee Rounded Up Tokens */
    safe_fee: number;
    /** Payment Sent Tokens Rounded Up */
    safe_tokens: number;
    /** Expiration Block Height */
    timeout: number;
    /** Total Tokens To Pay */
    tokens: number;
    /** Total Millitokens */
    total_mtokens?: string;
  };
};

export type SubscribeToProbeForRouteProbingEvent = {
  route: {
    /** Route Confidence Score Out Of One Million */
    confidence?: number;
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
    /** Total Millitokens To Pay */
    mtokens: string;
    /** Payment Identifier Hex */
    payment?: string;
    /** Payment Forwarding Fee Rounded Up Tokens */
    safe_fee: number;
    /** Payment Sent Tokens Rounded Up */
    safe_tokens: number;
    /** Expiration Block Height */
    timeout: number;
    /** Total Tokens To Pay */
    tokens: number;
    /** Total Millitokens */
    total_mtokens?: string;
  };
};

export type SubscribeToProbeForRouteRoutingFailureEvent = {
  /** Standard Format Channel Id */
  channel?: string;
  /** Millitokens */
  mtokens?: string;
  policy?: {
    /** Base Fee Millitokens */
    base_fee_mtokens: string;
    /** Locktime Delta */
    cltv_delta: number;
    /** Fees Charged in Millitokens Per Million */
    fee_rate: number;
    /** Channel is Disabled */
    is_disabled?: boolean;
    /** Maximum HLTC Millitokens Value */
    max_htlc_mtokens: string;
    /** Minimum HTLC Millitokens Value */
    min_htlc_mtokens: string;
  };
  /** Public Key Hex */
  public_key: string;
  /** Failure Reason */
  reason: string;
  route: {
    /** Route Confidence Score Out Of One Million */
    confidence?: number;
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
    /** Total Millitokens To Pay */
    mtokens: string;
    /** Payment Identifier Hex */
    payment?: string;
    /** Payment Forwarding Fee Rounded Up Tokens */
    safe_fee: number;
    /** Payment Sent Tokens Rounded Up */
    safe_tokens: number;
    /** Expiration Block Height */
    timeout: number;
    /** Total Tokens To Pay */
    tokens: number;
    /** Total Millitokens */
    total_mtokens?: string;
  };
  update?: {
    /** Chain Id Hex */
    chain: string;
    /** Channel Flags */
    channel_flags: number;
    /** Extra Opaque Data Hex */
    extra_opaque_data: string;
    /** Message Flags */
    message_flags: number;
    /** Channel Update Signature Hex */
    signature: string;
  };
};

/**
 * Subscribe to a probe attempt
 *
 * Requires `offchain:write` permission
 */
export const subscribeToProbeForRoute: AuthenticatedLightningSubscription<SubscribeToProbeForRouteArgs>;
