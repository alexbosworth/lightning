import {AuthenticatedLndMethod} from '../../typescript';

export type SettleHodlInvoiceArgs = {
  /** Payment Preimage Hex String */
  secret: string;
};

/**
 * Settle HODL invoice
 *
 * Requires LND built with `invoicesrpc` build tag
 *
 * Requires `invoices:write` permission
 */
export const settleHodlInvoice: AuthenticatedLndMethod<SettleHodlInvoiceArgs>;
