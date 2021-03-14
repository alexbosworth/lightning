import {AuthenticatedLightningSubscription} from '../../typescript';

export type SubscribeToTransactionsChainTransactionEvent = {
  /** Block Hash */
  block_id?: string;
  /** Confirmation Count */
  confirmation_count?: number;
  /** Confirmation Block Height */
  confirmation_height?: number;
  /** Created ISO 8601 Date */
  created_at: string;
  /** Fees Paid Tokens */
  fee?: number;
  /** Transaction Id */
  id: string;
  /** Is Confirmed */
  is_confirmed: boolean;
  /** Transaction Outbound */
  is_outgoing: boolean;
  /** Addresses */
  output_addresses: string[];
  /** Tokens Including Fee */
  tokens: number;
  /** Raw Transaction Hex */
  transaction?: string;
};

/**
 * Subscribe to transactions
 *
 * Requires `onchain:read` permission
 */
export const subscribeToTransactions: AuthenticatedLightningSubscription;
