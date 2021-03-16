import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type GetPendingChainBalanceArgs = AuthenticatedLightningArgs;

export type GetPendingChainBalanceResult = {
  /** Pending Chain Balance Tokens */
  pending_chain_balance: number;
};

/**
 * Get pending chain balance in simple unconfirmed outputs.
 *
 * Pending channels limbo balance is not included
 *
 * Requires `onchain:read` permission
 */
export const getPendingChainBalance: AuthenticatedLightningMethod<
  GetPendingChainBalanceArgs,
  GetPendingChainBalanceResult
>;
