import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type DeletePendingChannelArgs = AuthenticatedLightningArgs<{
  /** Hex Encoded Conflicting Transaction String */
  confirmed_transaction: string;
  /** Hex Encoded Pending Transaction String */
  pending_transaction: string;
  /** Pending Channel Output Index Number */
  pending_transaction_vout: number;
}>;

/**
 * Delete a pending channel
 *
 * Pass the confirmed conflicting transaction that spends the same input to make sure that no funds are being deleted.
 * This method is not supported on LND 0.13.3 and below
 */
export const deletePendingChannel: AuthenticatedLightningMethod<DeletePendingChannelArgs>;
