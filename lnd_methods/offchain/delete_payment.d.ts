import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type DeletePaymentArgs = AuthenticatedLightningArgs<{
  /** Payment Preimage Hash Hex String */
  id: string;
}>;

/**
 * Delete a payment record
 *
 * Requires `offchain:write` permission
 *
 * Note: this method is not supported on LND 0.13.4 and below
 */
export const deletePayment: AuthenticatedLightningMethod<DeletePaymentArgs>;
