import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type GetChainBalanceArgs = AuthenticatedLightningArgs;

export type GetChainBalanceResult = {
  /** Confirmed Chain Balance Tokens */
  chain_balance: number;
};

/**
 * Get balance on the chain.
 *
 * Requires `onchain:read` permission
 */
export const getChainBalance: AuthenticatedLightningMethod<
  GetChainBalanceArgs,
  GetChainBalanceResult
>;
