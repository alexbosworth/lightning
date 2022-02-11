import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
  PaginationArgs,
} from '../../typescript';

export type GetPendingPaymentsArgs = AuthenticatedLightningArgs<PaginationArgs>;

export type GetPendingPaymentsResult = {
  payments: {
    attempts: {
      failure?: {
        /** Error Type Code Number */
        code: number;
        details?: {
          /** Standard Format Channel Id String */
          channel?: string;
          /** Error Associated Block Height Number */
          height?: number;
          /** Pending Hop Index Number */
          index?: number;
          /** Error Millitokens String */
          mtokens?: string;
          policy?: {
            /** Base Fee Millitokens String */
            base_fee_mtokens: string;
            /** Locktime Delta Number */
            cltv_delta: number;
            /** Fees Charged in Millitokens Per Million Number */
            fee_rate: number;
            /** Channel is Disabled Bool */
            is_disabled?: boolean;
            /** Maximum HLTC Millitokens Value String */
            max_htlc_mtokens: string;
            /** Minimum HTLC Millitokens Value String */
            min_htlc_mtokens: string;
            /** Updated At ISO 8601 Date String */
            updated_at: string;
          };
          /** Error CLTV Timeout Height Number */
          timeout_height?: number;
          update?: {
            /** Chain Id Hex String */
            chain: string;
            /** Channel Flags Number */
            channel_flags: number;
            /** Extra Opaque Data Hex String */
            extra_opaque_data: string;
            /** Message Flags Number */
            message_flags: number;
            /** Channel Update Signature Hex String */
            signature: string;
          };
        };
        /** Error Message String */
        message: string;
      };
      /** Payment Add Index Number */
      index?: number;
      /** Payment Confirmed At ISO 8601 Date String */
      confirmed_at?: string;
      /** Payment Attempt Succeeded Bool */
      is_confirmed: boolean;
      /** Payment Attempt Pending Bool */
      is_failed: boolean;
      /** Payment Attempt is Waiting For Resolution Bool */
      is_pending: boolean;
      route: {
        /** Route Fee Tokens Number */
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
          public_key?: string;
          /** Timeout Block Height Number */
          timeout?: number;
        }[];
        /** Total Fee-Inclusive Millitokens String */
        mtokens: string;
        /** Payment Identifier Hex String */
        payment?: string;
        /** Timeout Block Height Number */
        timeout: number;
        /** Total Fee-Inclusive Tokens Number */
        tokens: number;
        /** Total Millitokens String */
        total_mtokens?: string;
      };
    }[];
    /** Payment at ISO-8601 Date String */
    created_at: string;
    /** Destination Node Public Key Hex String */
    destination?: string;
    /** Payment Preimage Hash String */
    id: string;
    /** Payment Add Index Number */
    index?: number;
    /** Payment is Confirmed Bool */
    is_confirmed: boolean;
    /** Transaction Is Outgoing Bool */
    is_outgoing: boolean;
    /** Millitokens Attempted to Pay to Destination String */
    mtokens: string;
    /** BOLT 11 Payment Request String */
    request?: string;
    /** Payment Tokens Attempted to Pay Rounded Up Number */
    safe_tokens: number;
    /** Rounded Down Tokens Attempted to Pay to Destination Number */
    tokens: number;
  }[];
  /** Next Opaque Paging Token String */
  next?: string;
};

/**
 * Get pending payments made through channels.
 *
 * Requires `offchain:read` permission
 */
export const getPendingPayments: AuthenticatedLightningMethod<
  GetPendingPaymentsArgs,
  GetPendingPaymentsResult
>;
