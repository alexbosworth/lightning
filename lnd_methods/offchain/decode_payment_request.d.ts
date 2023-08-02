import type {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
  Routes,
} from '../../typescript';

export type DecodePaymentRequestArgs = AuthenticatedLightningArgs<{
  /** BOLT 11 Payment Request */
  request: string;
}>;

export type DecodePaymentRequestResult = {
  /** Fallback Chain Address */
  chain_address: string;
  /** Final CLTV Delta */
  cltv_delta?: number;
  /** Payment Description */
  description: string;
  /** Payment Longer Description Hash */
  description_hash: string;
  /** Public Key */
  destination: string;
  /** ISO 8601 Date */
  expires_at: string;
  features: {
    /** BOLT 09 Feature Bit */
    bit: number;
    /** Feature is Known */
    is_known: boolean;
    /** Feature Support is Required To Pay */
    is_required: boolean;
    /** Feature Type */
    type: string;
  }[];
  /** Payment Hash */
  id: string;
  /** Requested Millitokens */
  mtokens: string;
  /** Payment Identifier Hex Encoded */
  payment?: string;
  routes: Routes;
  /** Requested Tokens Rounded Up */
  safe_tokens: number;
  /** Requested Tokens Rounded Down */
  tokens: number;
};

/**
 * Get decoded payment request
 *
 * Requires `offchain:read` permission
 */
export const decodePaymentRequest: AuthenticatedLightningMethod<
  DecodePaymentRequestArgs,
  DecodePaymentRequestResult
>;
