import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningSubscription,
} from '../../typescript';

export type SubscribeToPayViaRoutesArgs = AuthenticatedLightningArgs<{
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
    /** Expiration Block Height */
    timeout: number;
    /** Total Tokens To Pay */
    tokens: number;
  }[];
}>;

export type SubscribeToPayViaRoutesFailureEvent = {
  failure: [
    /** Code */
    number,
    /** Failure Message */
    string,
    {
      /** Standard Format Channel Id */
      channel: string;
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
        /** Maximum HLTC Millitokens value */
        max_htlc_mtokens: string;
        /** Minimum HTLC Millitokens Value */
        min_htlc_mtokens: string;
      };
      /** Public Key Hex */
      public_key: string;
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
    }
  ];
};

export type SubscribeToPayViaRoutesPayingEvent = {
  route: {
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
    /** Total Millitokens To Pay */
    mtokens: string;
    /** Expiration Block Height */
    timeout: number;
    /** Total Tokens To Pay */
    tokens: number;
  };
};

export type SubscribeToPayViaRoutesRoutingFailureEvent = {
  /** Standard Format Channel Id */
  channel?: string;
  /** Failure Hop Index */
  index?: number;
  /** Failure Related Millitokens */
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
    /** Maximum HLTC Millitokens value */
    max_htlc_mtokens: string;
    /** Minimum HTLC Millitokens Value */
    min_htlc_mtokens: string;
  };
  /** Public Key Hex */
  public_key: string;
  /** Failure Reason */
  reason: string;
  route: {
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
    /** Total Millitokens To Pay */
    mtokens: string;
    /** Payment Forwarding Fee Rounded Up Tokens Number */
    safe_fee: number;
    /** Payment Tokens Rounded Up Number */
    safe_tokens: number;
    /** Expiration Block Height */
    timeout: number;
    /** Total Tokens To Pay */
    tokens: number;
  };
  /** Failure Related CLTV Timeout Height */
  timeout_height?: number;
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

export type SubscribeToPayViaRoutesSuccessEvent = {
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
  route: {
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
    /** Total Millitokens To Pay */
    mtokens: string;
    /** Payment Forwarding Fee Rounded Up Tokens Number */
    safe_fee: number;
    /** Payment Tokens Rounded Up Number */
    safe_tokens: number;
    /** Expiration Block Height */
    timeout: number;
    /** Total Tokens To Pay */
    tokens: number;
  };
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
 * Subscribe to the attempts of paying via specified routes
 *
 * Requires `offchain:write` permission
 */
export const subscribeToPayViaRoutes: AuthenticatedLightningSubscription<SubscribeToPayViaRoutesArgs>;
