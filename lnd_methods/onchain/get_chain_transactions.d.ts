import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type GetChainTransactionsArgs = AuthenticatedLightningArgs<{
  /** Confirmed After Current Best Chain Block Height */
  after?: number;
  /** Confirmed Before Current Best Chain Block Height */
  before?: number;
}>;

export type ChainTransaction = {
  /** Block Hash */
  block_id?: string;
  /** Confirmation Count */
  confirmation_count?: number;
  /** Confirmation Block Height */
  confirmation_height?: number;
  /** Created ISO 8601 Date */
  created_at: string;
  /** Transaction Label */
  description?: string;
  /** Fees Paid Tokens */
  fee?: number;
  /** Transaction Id */
  id: string;
  inputs: {
    /** Spent Outpoint is Local */
    is_local: boolean;
    /** Transaction Id Hex */
    transaction_id: string;
    /** Transaction Output Index */
    transaction_vout: number;
  }[];
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

export type GetChainTransactionsResult = {
  transactions: ChainTransaction[];
};

/**
 * Get chain transactions.
 *
 * Requires `onchain:read` permission
 *
 * `inputs` are not supported on LND 0.15.0 and below
 */
export const getChainTransactions: AuthenticatedLightningMethod<
  GetChainTransactionsArgs,
  GetChainTransactionsResult
>;
