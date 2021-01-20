import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type CancelHodlInvoiceArgs = AuthenticatedLightningArgs<{
  /** Payment Preimage Hash Hex String */
  id: string;
}>;

/**
 * Cancel an invoice
 *
 * This call can cancel both HODL invoices and also void regular invoices
 *
 * Requires LND built with `invoicesrpc`
 *
 * Requires `invoices:write` permission
 */
export const cancelHodlInvoice: AuthenticatedLightningMethod<CancelHodlInvoiceArgs>;
