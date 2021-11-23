import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';
import {MergeExclusive} from 'type-fest';

type Tokens = MergeExclusive<
  {
    /** Millitokens to Send */
    mtokens?: string;
  },
  {
    /** Tokens to Send */
    tokens?: number;
  }
>;

export type GetRouteThroughHopsArgs = AuthenticatedLightningArgs<
  Tokens & {
    /** Final CLTV Delta */
    cltv_delta?: number;
    /** Outgoing Channel Id */
    outgoing_channel?: string;
    messages?: {
      /** Message Type number */
      type: string;
      /** Message Raw Value Hex Encoded */
      value: string;
    }[];
    /** Payment Identifier Hex */
    payment?: string;
    /** Public Key Hex Strings */
    public_keys: string[];
    /** Payment Total Millitokens */
    total_mtokens?: string;
  }
>;

export type GetRouteThroughHopsResult = {
  route: {
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
    /** Payment Identifier Hex */
    payment?: string;
    /** Payment Forwarding Fee Rounded Up Tokens */
    safe_fee: number;
    /** Payment Tokens Rounded Up */
    safe_tokens: number;
    /** Route Timeout Height */
    timeout: number;
    /** Total Fee-Inclusive Tokens */
    tokens: number;
    /** Payment Total Millitokens */
    total_mtokens?: string;
  };
};

/**
 * Get an outbound route that goes through specific hops
 *
 * Requires `offchain:read` permission
 */
export const getRouteThroughHops: AuthenticatedLightningMethod<
  GetRouteThroughHopsArgs,
  GetRouteThroughHopsResult
>;
