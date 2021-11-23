import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningSubscription,
} from '../../typescript';
import {MergeExclusive} from 'type-fest';

export type SubscribeToPayWithDestinationArgs = {
  /** Destination Public Key String> */
  destination: string;
  /** Payment Request Hash Hex String> */
  id: string;
  /** Final CLTV Delta Number> */
  cltv_delta?: number;
};

export type SubscribeToPayWithRequestArgs = {
  /** BOLT 11 Payment Request String> */
  request: string;
};

export type SubscribeToPayWithDestinationOrRequestArgs = MergeExclusive<
  SubscribeToPayWithDestinationArgs,
  SubscribeToPayWithRequestArgs
>;

export type SubscribeToPayOptionsArgs = {
  features?: {
    /** Feature Bit Number> */
    bit: number;
  }[];
  /** Pay Through Specific Final Hop Public Key Hex String> */
  incoming_peer?: string;
  /** Maximum Fee Tokens To Pay Number> */
  max_fee?: number;
  /** Maximum Fee Millitokens to Pay String> */
  max_fee_mtokens?: string;
  /** Maximum Millitokens For A Multi-Path Path */
  max_path_mtokens?: string;
  /** Maximum Simultaneous Paths Number> */
  max_paths?: number;
  /** Maximum Height of Payment Timeout Number> */
  max_timeout_height?: number;
  messages?: {
    /** Message Type Number String> */
    type: string;
    /** Message Raw Value Hex Encoded String> */
    value: string;
  }[];
  /** Millitokens to Pay String> */
  mtokens?: string;
  /** Pay Out of Outgoing Channel Id String> */
  outgoing_channel?: string;
  /** Pay Out of Outgoing Channel Ids String> */
  outgoing_channels?: string[];
  /** Time to Spend Finding a Route Milliseconds Number> */
  pathfinding_timeout?: number;
  /** Payment Identifier Hex String> */
  payment?: string;
  routes?: {
    /** Base Routing Fee In Millitokens String> */
    base_fee_mtokens?: string;
    /** Standard Format Channel Id String> */
    channel?: string;
    /** CLTV Blocks Delta Number> */
    cltv_delta?: number;
    /** Fee Rate In Millitokens Per Million Number> */
    fee_rate?: number;
    /** Forward Edge Public Key Hex String> */
    public_key: string;
  }[][];
  /** Tokens to Pay Number> */
  tokens?: number;
};

export type SubscribeToPayArgs = AuthenticatedLightningArgs<
  SubscribeToPayWithDestinationOrRequestArgs & SubscribeToPayOptionsArgs
>;

export type SubscribeToPayConfirmedEvent = {
  /** Payment Confirmed At ISO 8601 Date String */
  confirmed_at: string;
  /** Total Fee Tokens Paid Rounded Down Number> */
  fee: number;
  /** Total Fee Millitokens Paid String> */
  fee_mtokens: string;
  hops: {
    /** First Route Standard Format Channel Id String> */
    channel: string;
    /** First Route Channel Capacity Tokens Number> */
    channel_capacity: number;
    /** First Route Fee Tokens Rounded Down Number> */
    fee: number;
    /** First Route Fee Millitokens String> */
    fee_mtokens: string;
    /** First Route Forward Millitokens String> */
    forward_mtokens: string;
    /** First Route Public Key Hex String> */
    public_key: string;
    /** First Route Timeout Block Height Number> */
    timeout: number;
  }[];
  /** Payment Hash Hex String> */
  id: string;
  /** Total Millitokens Paid String> */
  mtokens: string;
  paths: {
    /** Total Fee Millitokens Paid String> */
    fee_mtokens: string;
    hops: {
      /** First Route Standard Format Channel Id String> */
      channel: string;
      /** First Route Channel Capacity Tokens Number> */
      channel_capacity: number;
      /** First Route Fee Tokens Rounded Down Number> */
      fee: number;
      /** First Route Fee Millitokens String> */
      fee_mtokens: string;
      /** First Route Forward Millitokens String> */
      forward_mtokens: string;
      /** First Route Public Key Hex String> */
      public_key: string;
      /** First Route Timeout Block Height Number> */
      timeout: number;
    }[];
    /** Total Millitokens Paid String> */
    mtokens: string;
  }[];
  /** Total Fee Tokens Paid Rounded Up Number> */
  safe_fee: number;
  /** Total Tokens Paid, Rounded Up Number> */
  safe_tokens: number;
  /** Payment Preimage Hex String> */
  secret: string;
  /** Expiration Block Height Number> */
  timeout: number;
  /** Total Tokens Paid Rounded Down Number> */
  tokens: number;
};

export type SubscribeToPayFailedEvent = {
  /** Failed Due To Lack of Balance Bool> */
  is_insufficient_balance: boolean;
  /** Failed Due to Invalid Payment Bool> */
  is_invalid_payment: boolean;
  /** Failed Due to Pathfinding Timeout Bool> */
  is_pathfinding_timeout: boolean;
  /** Failed Due to Route Not Found Bool> */
  is_route_not_found: boolean;
  route?: {
    /** Route Total Fee Tokens Rounded Down Number> */
    fee: number;
    /** Route Total Fee Millitokens String> */
    fee_mtokens: string;
    hops: {
      /** Standard Format Channel Id String> */
      channel: string;
      /** Channel Capacity Tokens Number> */
      channel_capacity: number;
      /** Hop Forwarding Fee Rounded Down Tokens Number> */
      fee: number;
      /** Hop Forwarding Fee Millitokens String> */
      fee_mtokens: string;
      /** Hop Forwarding Tokens Rounded Down Number> */
      forward: number;
      /** Hop Forwarding Millitokens String> */
      forward_mtokens: string;
      /** Hop Sending To Public Key Hex String> */
      public_key: string;
      /** Hop CTLV Expiration Height Number> */
      timeout: number;
    }[];
    /** Payment Sending Millitokens String> */
    mtokens: string;
    /** Payment Forwarding Fee Rounded Up Tokens Number> */
    safe_fee: number;
    /** Payment Sending Tokens Rounded Up Number> */
    safe_tokens: number;
    /** Payment CLTV Expiration Height Number> */
    timeout: number;
    /** Payment Sending Tokens Rounded Down Number> */
    tokens: number;
  };
};

export type SubscribeToPayPayingEvent = {
  /** Payment Created At ISO 8601 Date String> */
  created_at: string;
  /** Payment Destination Hex String> */
  destination: string;
  /** Payment Hash Hex String> */
  id: string;
  /** Total Millitokens Pending String> */
  mtokens: string;
  paths: {
    /** Total Fee Tokens Pending Number> */
    fee: number;
    /** Total Fee Millitokens Pending String> */
    fee_mtokens: string;
    hops: {
      /** Standard Format Channel Id String> */
      channel: string;
      /** Channel Capacity Tokens Number> */
      channel_capacity: number;
      /** Fee Tokens Rounded Down Number> */
      fee: number;
      /** Fee Millitokens String> */
      fee_mtokens: string;
      /** Forward Tokens Number> */
      forward: number;
      /** Forward Millitokens String> */
      forward_mtokens: string;
      /** Public Key Hex String> */
      public_key: string;
      /** Timeout Block Height Number> */
      timeout: number;
    }[];
    /** Total Millitokens Pending String> */
    mtokens: string;
    /** Total Fee Tokens Pending Rounded Up Number> */
    safe_fee: number;
    /** Total Tokens Pending, Rounded Up Number> */
    safe_tokens: number;
    /** Expiration Block Height Number> */
    timeout: number;
  }[];
  /** BOLT 11 Encoded Payment Request String> */
  request?: string;
  /** Total Tokens Pending, Rounded Up Number> */
  safe_tokens: number;
  /** Expiration Block Height Number> */
  timeout?: number;
  /** Total Tokens Pending Rounded Down Number> */
  tokens: number;
};

export type SubscribeToRoutingFailureEvent = {
  /** Standard Format Channel Id String> */
  channel?: string;
  /** Failure Index Number> */
  index: number;
  /** Millitokens String> */
  mtokens?: string;
  /** Public Key Hex String> */
  public_key?: string;
  /** Failure Reason String> */
  reason: string;
  route: {
    /** Total Route Fee Tokens To Pay Number> */
    fee: number;
    /** Total Route Fee Millitokens To Pay String> */
    fee_mtokens: string;
    hops: {
      /** Standard Format Channel Id String> */
      channel: string;
      /** Channel Capacity Tokens Number> */
      channel_capacity: number;
      /** Fee Number> */
      fee: number;
      /** Fee Millitokens String> */
      fee_mtokens: string;
      /** Forward Tokens Number> */
      forward: number;
      /** Forward Millitokens String> */
      forward_mtokens: string;
      /** Public Key Hex String> */
      public_key: string;
      /** Timeout Block Height Number> */
      timeout: number;
    }[];
    /** Total Route Millitokens String> */
    mtokens: string;
    /** Payment Identifier Hex String> */
    payment?: string;
    /** Expiration Block Height Number> */
    timeout: number;
    /** Total Route Tokens Number> */
    tokens: number;
    /** Total Millitokens String> */
    total_mtokens?: string;
  };
};

/**
 * Initiate and subscribe to the outcome of a payment
 *
 * Either a request or a destination, id, and tokens amount is required
 *
 * `max_path_mtokens` is not supported in LND 0.12.0 or below
 *
 */
export const subscribeToPay: AuthenticatedLightningSubscription<SubscribeToPayArgs>;
