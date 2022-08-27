import {AuthenticatedLightningSubscription} from '../../typescript';
import {ChainTransaction} from './get_chain_transactions';

export type SubscribeToTransactionsChainTransactionEvent = Omit<
  ChainTransaction,
  'description'
>;

/**
 * Subscribe to transactions
 *
 * Requires `onchain:read` permission
 *
 * `inputs` are not supported on LND 0.15.0 and below
 */
export const subscribeToTransactions: AuthenticatedLightningSubscription;
