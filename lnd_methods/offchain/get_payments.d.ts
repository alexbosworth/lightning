import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
  PaginationArgs,
} from '../../typescript';

export type GetPaymentsArgs = AuthenticatedLightningArgs<PaginationArgs>;

export type GetPaymentsResult = {
  payments: {
    attempts: {
      failure?: {
        /** Error Type Code */
        code: number;
        details?: {
          /** Standard Format Channel Id */
          channel?: string;
          /** Error Associated Block Height */
          height?: number;
          /** Failed Hop Index */
          index?: number;
          /** Error Millitokens */
          mtokens?: string;
          policy?: {
            /** Base Fee Millitokens */
            base_fee_mtokens: string;
            /** Locktime Delta */
            cltv_delta: number;
            /** Fees Charged Per Million Tokens */
            fee_rate: number;
            /** Channel is Disabled */
            is_disabled?: boolean;
            /** Maximum HLTC Millitokens Value */
            max_htlc_mtokens: string;
            /** Minimum HTLC Millitokens Value */
            min_htlc_mtokens: string;
            /** Updated At ISO 8601 Date */
            updated_at: string;
          };
          /** Error CLTV Timeout Height */
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
        /** Error Message */
        message: string;
      };
      /** Confirmed at ISO-8601 Date */
      confirmed_at?: string;
      /** Payment Attempt Succeeded */
      is_confirmed: boolean;
      /** Payment Attempt Failed */
      is_failed: boolean;
      /** Payment Attempt is Waiting For Resolution */
      is_pending: boolean;
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
          public_key?: string;
          /** Timeout Block Height */
          timeout?: number;
        }[];
        /** Total Fee-Inclusive Millitokens */
        mtokens: string;
        /** Payment Identifier Hex */
        payment?: string;
        /** Timeout Block Height */
        timeout: number;
        /** Total Fee-Inclusive Tokens */
        tokens: number;
        /** Total Millitokens */
        total_mtokens?: string;
      };
    }[];
    /** Confirmed at ISO-8601 Date */
    confirmed_at: string;
    /** Payment at ISO-8601 Date */
    created_at: string;
    /** Destination Node Public Key Hex */
    destination: string;
    /** Paid Routing Fee Rounded Down Tokens */
    fee: number;
    /** Paid Routing Fee in Millitokens */
    fee_mtokens: string;
    /** First Route Hop Public Key Hex */
    hops: string[];
    /** Payment Preimage Hash */
    id: string;
    /** Payment Add Index */
    index?: number;
    /** Payment is Confirmed */
    is_confirmed: boolean;
    /** Transaction Is Outgoing */
    is_outgoing: boolean;
    /** Millitokens Sent to Destination */
    mtokens: string;
    /** BOLT 11 Payment Request */
    request?: string;
    /** Payment Forwarding Fee Rounded Up Tokens */
    safe_fee: number;
    /** Payment Tokens Rounded Up */
    safe_tokens: number;
    /** Payment Preimage Hex */
    secret: string;
    /** Rounded Down Tokens Sent to Destination */
    tokens: number;
  }[];
  /** Next Opaque Paging Token */
  next?: string;
};

/**
 * Get payments made through channels.
 *
 * Requires `offchain:read` permission
 */
export const getPayments: AuthenticatedLightningMethod<
  GetPaymentsArgs,
  GetPaymentsResult
>;
