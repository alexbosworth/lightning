import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type GetUtxosArgs = AuthenticatedLightningArgs<{
  /** Maximum Confirmations */
  max_confirmations?: number;
  /** Minimum Confirmations */
  min_confirmations?: number;
}>;

export type GetUtxosResult = {
  utxos: {
    /** Chain Address */
    address: string;
    /** Chain Address Format */
    address_format: string;
    /** Confirmation Count */
    confirmation_count: number;
    /** Output Script Hex */
    output_script: string;
    /** Unspent Tokens */
    tokens: number;
    /** Transaction Id Hex */
    transaction_id: string;
    /** Transaction Output Index */
    transaction_vout: number;
  }[];
};

/**
 * Get unspent transaction outputs
 *
 * Requires `onchain:read` permission
 */
export const getUtxos: AuthenticatedLightningMethod<
  GetUtxosArgs,
  GetUtxosResult
>;
