import { FailureReason, HtlcStatus, PaymentState } from '../typescript';

export type ConfirmedFromPaymentArgs = {
  /** Creation Date Epoch Time Seconds String */
  creation_date: string;
  /** Creation Date Epoch Time Nanoseconds String */
  creation_time_ns: string;
  /** Payment Failure Reason String */
  failure_reason: FailureReason;
  /** Fee Paid in Millitokens String */
  fee_msat: string;
  /** Fee Paid in Tokens String */
  fee_sat: string;
  htlcs: {
    /** HTLC Sent At Epoch Time Nanoseconds String */
    attempt_time_ns: string;
    /** HTLC Resolved At Epoch Time Nanoseconds String */
    resolve_time_ns: string;
    route: {
      hops: {
        /** Tokens to Forward String */
        amt_to_forward: string;
        /** Millitokens to Forward String */
        amt_to_forward_msat: string;
        /** Numeric Format Channel Id String */
        chan_id: string;
        /** Channel Capacity String */
        chan_capacity: string;
        custom_records: {
          [key: string]: Buffer;
        };
        /** Timeout Chain Height Number */
        expiry: number;
        /** Fee in Tokens String */
        fee: string;
        /** Fee in Millitokens String */
        fee_msat: string;
        mpp_record?: {
          /** Payment Identifier Buffer */
          payment_addr: Buffer;
          /** Total Payment Millitokens Amount String */
          total_amt_msat: string;
        };
        /** Next Hop Public Key Hex String */
        pub_key?: string;
        /** Has Extra TLV Data Bool */
        tlv_payload: boolean;
      }[];
      /** Total Tokens String */
      total_amt: string;
      /** Route Total Millitokens String */
      total_amt_msat: string;
      /** Route Fee Tokens String */
      total_fees: string;
      /** Route Total Fees Millitokens String */
      total_fees_msat: string;
      /** Route Total Timelock Number */
      total_time_lock: number;
    };
    /** HTLC Status String */
    status: HtlcStatus;
  }[];
  /** Hop Public Key Hex Strings */
  path: string[];
  /** Preimage SHA256 Hash Hex String */
  payment_hash: string;
  /** Payment Index String */
  payment_index: string;
  /** Payment Secret Preimage Hex String */
  payment_preimage: string;
  /** BOLT 11 Payment Request String */
  payment_request: string;
  /** Payment State String */
  status: PaymentState;
  /** Tokens String */
  value: string;
  /** Paid Tokens Without Routing Fees Millitokens String */
  value_msat: string;
  /** Paid Tokens Without Routing Fees String */
  value_sat: string;
};

export type ConfirmedFromPaymentResult = {
  /** Total Fee Tokens Paid Rounded Down Number */
  fee: number;
  /** Total Fee Millitokens Paid String */
  fee_mtokens: string;
  hops: {
    /** First Path Standard Format Channel Id String */
    channel: string;
    /** First Path Channel Capacity Tokens Number */
    channel_capacity: number;
    /** First Route Fee Path Rounded Down Number */
    fee: number;
    /** First Path Fee Millitokens String */
    fee_mtokens: string;
    /** First Path Forward Tokens Number */
    forward: number;
    /** First Path Forward Millitokens String */
    forward_mtokens: string;
    /** First Path Public Key Hex String */
    public_key: string;
    /** First Path Timeout Block Height Number */
    timeout: number;
  }[];
  /** Payment Hash Hex String */
  id: string;
  /** Total Millitokens Paid String */
  mtokens: string;
  paths: {
    /** Total Fee Tokens Paid Number */
    fee: number;
    /** Total Fee Millitokens Paid String */
    fee_mtokens: string;
    hops: {
      /** Standard Format Channel Id String */
      channel: string;
      /** Channel Capacity Tokens Number */
      channel_capacity: number;
      /** Fee Tokens Rounded Down Number */
      fee: number;
      /** Fee Millitokens String */
      fee_mtokens: string;
      /** Forward Tokens Number */
      forward: number;
      /** Forward Millitokens String */
      forward_mtokens: string;
      /** Public Key Hex String */
      public_key: string;
      /** Timeout Block Height Number */
      timeout: number;
    }[];
    /** Total Millitokens Paid String */
    mtokens: string;
    /** Total Fee Tokens Paid Rounded Up Number */
    safe_fee: number;
    /** Total Tokens Paid, Rounded Up Number */
    safe_tokens: number;
    /** Expiration Block Height Number */
    timeout: number;
  }[];
  /** Total Fee Tokens Paid Rounded Up Number */
  safe_fee: number;
  /** Total Tokens Paid, Rounded Up Number */
  safe_tokens: number;
  /** Payment Preimage Hex String */
  secret: string;
  /** Expiration Block Height Number */
  timeout?: number;
  /** Total Tokens Paid Rounded Down Number */
  tokens: number;
};

/**
 *
 * Calculate total payment details from RPC payment HTLC elements
 *
 * The `route` attribute only returns the first route, there may be more due to payment splitting
 */
export const confirmedFromPayment: (
  payment: ConfirmedFromPaymentArgs
) => ConfirmedFromPaymentResult;
