import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type UpdateChainTransactionArgs = AuthenticatedLightningArgs<{
  /** Transaction Label */
  description: string;
  /** Transaction Id Hex */
  id: string;
}>;

/**
 * Update an on-chain transaction record metadata
 *
 * Requires LND built with `walletrpc` build tag
 *
 * Requires `onchain:write` permission
 */
export const updateChainTransaction: AuthenticatedLightningMethod<UpdateChainTransactionArgs>;
