import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type GetSweepTransactionArgs = AuthenticatedLightningArgs<{
  /** Confirmed After Block Height */
  after?: number;
}>;

export type GetSweepTransactionsResult = {
  transactions: {
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
    spends: {
      /** Output Tokens */
      tokens?: number;
      /** Spend Transaction Id Hex */
      transaction_id: string;
      /** Spend Transaction Output Index */
      transaction_vout: number;
    }[];
    /** Tokens Including Fee */
    tokens: number;
    /** Raw Transaction Hex */
    transaction?: string;
  }[];
};

/**
 * Get self-transfer spend transactions related to channel closes
 *
 * Requires `onchain:read` permission
 *
 * Requires LND built with `walletrpc` build tag
 *
 * `after` is not supported in LND 0.17.3 or below
 */
export const getSweepTransactions: AuthenticatedLightningMethod<
  GetSweepTransactionArgs,
  GetSweepTransactionsResult
>;
