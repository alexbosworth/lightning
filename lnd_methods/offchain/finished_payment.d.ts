import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type FinishedPaymentArgs = AuthenticatedLightningArgs<{
  confirmed?: {
    /** Total Fee Tokens Paid Rounded Down Number */
    fee: number;
    /** Total Fee Millitokens Paid String */
    fee_mtokens: string;
    hops: {
      /** First Route Standard Format Channel Id String */
      channel: string;
      /** First Route Channel Capacity Tokens Number */
      channel_capacity: number;
      /** First Route Fee Tokens Rounded Down Number */
      fee: number;
      /** First Route Fee Millitokens String */
      fee_mtokens: string;
      /** First Route Forward Millitokens String */
      forward_mtokens: string;
      /** First Route Public Key Hex String */
      public_key: string;
      /** First Route Timeout Block Height Number */
      timeout: number;
    }[];
    /** Payment Hash Hex String */
    id: string;
    /** Total Millitokens Paid String */
    mtokens: string;
    paths: {
      /** Total Fee Millitokens Paid String */
      fee_mtokens: string;
      hops: {
        /** First Route Standard Format Channel Id String */
        channel: string;
        /** First Route Channel Capacity Tokens Number */
        channel_capacity: number;
        /** First Route Fee Tokens Rounded Down Number */
        fee: number;
        /** First Route Fee Millitokens String */
        fee_mtokens: string;
        /** First Route Forward Millitokens String */
        forward_mtokens: string;
        /** First Route Public Key Hex String */
        public_key: string;
        /** First Route Timeout Block Height Number */
        timeout: number;
      }[];
      /** Total Millitokens Paid String */
      mtokens: string;
    }[];
    /** Total Fee Tokens Paid Rounded Up Number */
    safe_fee: number;
    /** Total Tokens Paid, Rounded Up Number */
    safe_tokens: number;
    /** Payment Preimage Hex String */
    secret: string;
    /** Expiration Block Height Number */
    timeout: number;
    /** Total Tokens Paid Rounded Down Number */
    tokens: number;
  };
  failed?: {
    /** Failed Due To Lack of Balance Bool */
    is_insufficient_balance: boolean;
    /** Failed Due to Invalid Payment Bool */
    is_invalid_payment: boolean;
    /** Failed Due to Pathfinding Timeout Bool */
    is_pathfinding_timeout: boolean;
    /** Failed Due to Route Not Found Bool */
    is_route_not_found: boolean;
    route?: {
      /** Route Total Fee Tokens Rounded Down Number */
      fee: number;
      /** Route Total Fee Millitokens String */
      fee_mtokens: string;
      hops: {
        /** Standard Format Channel Id String */
        channel: string;
        /** Channel Capacity Tokens Number */
        channel_capacity: number;
        /** Hop Forwarding Fee Rounded Down Tokens Number */
        fee: number;
        /** Hop Forwarding Fee Millitokens String */
        fee_mtokens: string;
        /** Hop Forwarding Tokens Rounded Down Number */
        forward: number;
        /** Hop Forwarding Millitokens String */
        forward_mtokens: string;
        /** Hop Sending To Public Key Hex String */
        public_key: string;
        /** Hop CTLV Expiration Height Number */
        timeout: number;
      }[];
      /** Payment Sending Millitokens String */
      mtokens: string;
      /** Payment Forwarding Fee Rounded Up Tokens Number */
      safe_fee: number;
      /** Payment Sending Tokens Rounded Up Number */
      safe_tokens: number;
      /** Payment CLTV Expiration Height Number */
      timeout: number;
      /** Payment Sending Tokens Rounded Down Number */
      tokens: number;
    };
  };
}>;

export type FinishedPaymentResult = {
  /** Fee Tokens Number */
  fee: number;
  /** Total Fee Millitokens To Pay String */
  fee_mtokens: string;
  hops: {
    /** Standard Format Channel Id String */
    channel: string;
    /** Channel Capacity Tokens Number */
    channel_capacity: number;
    /** Fee Millitokens String */
    fee_mtokens: string;
    /** Forward Millitokens String */
    forward_mtokens: string;
    /** Public Key Hex String */
    public_key: string;
    /** Timeout Block Height Number */
    timeout: number;
  }[];
  /** Payment Hash Hex String */
  id?: string;
  /** Total Millitokens Paid String */
  mtokens: string;
  paths: {
    /** Total Fee Millitokens Paid String */
    fee_mtokens: string;
    hops: {
      /** First Route Standard Format Channel Id String */
      channel: string;
      /** First Route Channel Capacity Tokens Number */
      channel_capacity: number;
      /** First Route Fee Tokens Rounded Down Number */
      fee: number;
      /** First Route Fee Millitokens String */
      fee_mtokens: string;
      /** First Route Forward Millitokens String */
      forward_mtokens: string;
      /** First Route Public Key Hex String */
      public_key: string;
      /** First Route Timeout Block Height Number */
      timeout: number;
    }[];
    /** Total Millitokens Paid String */
    mtokens: string;
  }[];
  /** Payment Forwarding Fee Rounded Up Tokens Number */
  safe_fee: number;
  /** Payment Tokens Rounded Up Number */
  safe_tokens: number;
  /** Payment Preimage Hex String */
  secret: string;
  /** Expiration Block Height Number */
  timeout: number;
  /** Tokens Paid Rounded Down Number */
  tokens: number;
};

/**
 * Convert payment finished details to a finished payment response
 */
export const finishedPayment: AuthenticatedLightningMethod<
  FinishedPaymentArgs,
  FinishedPaymentResult
>;
