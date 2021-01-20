import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type SettleHodlInvoiceArgs = AuthenticatedLightningArgs<{
  /** Payment Preimage Hex String */
  secret: string;
}>;

/**
 * Settle HODL invoice
 *
 * Requires LND built with `invoicesrpc` build tag
 *
 * Requires `invoices:write` permission
 */
export const settleHodlInvoice: AuthenticatedLightningMethod<SettleHodlInvoiceArgs>;
