import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type CreateInvoiceArgs = AuthenticatedLightningArgs<{
  /** CLTV Delta */
  cltv_delta?: number;
  /** Invoice Description */
  description?: string;
  /** Hashed Description of Payment Hex String */
  description_hash?: string;
  /** Expires At ISO 8601 Date */
  expires_at?: string;
  /** Is Fallback Address Included */
  is_fallback_included?: boolean;
  /** Is Fallback Address Nested */
  is_fallback_nested?: boolean;
  /** Invoice Includes Private Channels */
  is_including_private_channels?: boolean;
  /** Payment Preimage Hex String */
  secret?: string;
  /** Millitokens */
  mtokens?: string;
  /** Tokens */
  tokens?: number;
}>;

export type CreateInvoiceResult = {
  /** Backup Address */
  chain_address?: string;
  /** ISO 8601 Date */
  created_at: string;
  /** Description */
  description?: string;
  /** Payment Hash Hex String */
  id: string;
  /** Millitokens */
  mtokens?: string;
  /**
   * Payment Identifying Secret Hex String
   *
   * not supported on LND 0.11.1 and below
   */
  payment?: string;
  /** BOLT 11 Encoded Payment Request */
  request: string;
  /** Hex Encoded Payment Secret */
  secret: string;
  /** Tokens */
  tokens?: number;
};

/**
 * Create a Lightning invoice.
 *
 * Requires `address:write`, `invoices:write` permission
 *
 * `payment` is not supported on LND 0.11.1 and below
 */
export const createInvoice: AuthenticatedLightningMethod<
  CreateInvoiceArgs,
  CreateInvoiceResult
>;
