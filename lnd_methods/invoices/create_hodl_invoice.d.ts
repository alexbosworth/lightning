import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type CreateHodlInvoiceArgs = AuthenticatedLightningArgs<{
  /** Final CLTV Delta */
  cltv_delta?: number;
  /** Invoice Description */
  description?: string;
  /** Hashed Description of Payment Hex String */
  description_hash?: string;
  /** Expires At ISO 8601 Date */
  expires_at?: string;
  /** Payment Hash Hex String */
  id?: string;
  /** Is Fallback Address Included */
  is_fallback_included?: boolean;
  /** Is Fallback Address Nested */
  is_fallback_nested?: boolean;
  /** Invoice Includes Private Channels */
  is_including_private_channels?: boolean;
  /** Millitokens */
  mtokens?: string;
  /** Tokens */
  tokens?: number;
}>;

export type CreateHodlInvoiceResult = {
  /** Backup Address String */
  chain_address?: string;
  /** ISO 8601 Date String */
  created_at: string;
  /** Description String */
  description: string;
  /** Payment Hash Hex String */
  id: string;
  /** Millitokens Number */
  mtokens: number;
  /** BOLT 11 Encoded Payment Request String */
  request: string;
  /** Hex Encoded Payment Secret String */
  secret?: string;
  /** Tokens Number */
  tokens: number;
};

/**
 * Create HODL invoice. This invoice will not settle automatically when an HTLC arrives. It must be settled separately with the secret preimage.
 *
 * Warning: make sure to cancel the created invoice before its CLTV timeout.
 *
 * Requires LND built with `invoicesrpc` tag
 *
 * Requires `address:write`, `invoices:write` permission
 */
export const createHodlInvoice: AuthenticatedLightningMethod<
  CreateHodlInvoiceArgs,
  CreateHodlInvoiceResult
>;
