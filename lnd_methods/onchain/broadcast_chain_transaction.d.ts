import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type BroadcastChainTransactionArgs = AuthenticatedLightningArgs<{
  /** Transaction Label */
  description?: string;
  /** Transaction Hex */
  transaction: string;
}>;

export type BroadcastChainTransactionResult = {
  /** Transaction Id Hex String */
  id: string;
};

/**
 * Publish a raw blockchain transaction to Blockchain network peers
 *
 * Requires LND built with `walletrpc` tag
 *
 * Requires `onchain:write` permission
 */
export const broadcastChainTransaction: AuthenticatedLightningMethod<
  BroadcastChainTransactionArgs,
  BroadcastChainTransactionResult
>;
