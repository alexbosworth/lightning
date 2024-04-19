import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';
import {ChainTransaction} from './get_chain_transactions';

export type GetChainTransactionArgs = AuthenticatedLightningArgs<{
  /** Transaction Id Hex String */
  id: string;
}>;

export type GetChainTransactionResult = ChainTransaction;

/**
 * Get a chain transaction.
 *
 * Requires `onchain:read` permission
 *
 * This method is not supported on LND 0.17.5 and below
 */
export const getChainTransaction: AuthenticatedLightningMethod<
  GetChainTransactionArgs,
  GetChainTransactionResult
>;
