import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type DeleteChainTransactionArgs = AuthenticatedLightningArgs<{
  /** Transaction Id Hex String */
  id: string;
}>;

/**
 *
 * Remove a chain transaction.
 *
 * Requires `onchain:write` permission
 *
 * This method is not supported on LND 0.17.5 and below
 */
export const deleteChainTransaction: AuthenticatedLightningMethod<DeleteChainTransactionArgs>;
