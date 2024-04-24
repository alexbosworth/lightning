import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
  UtxoSelection,
} from '../../typescript';

export type GetChainFeeEstimateArgs = AuthenticatedLightningArgs<{
  send_to: {
    /** Address */
    address: string;
    /** Tokens */
    tokens: number;
  }[];
  /** Target Confirmations */
  target_confirmations?: number;
  /** Minimum Confirmations for UTXO Selection */
  utxo_confirmations?: number;
  /** Select UTXOs Using Method String */
  utxo_selection?: UtxoSelection;
}>;

export type GetChainFeeEstimateResult = {
  /** Total Fee Tokens */
  fee: number;
  /** Fee Tokens Per VByte */
  tokens_per_vbyte: number;
};

/**
 * Get a chain fee estimate for a prospective chain send
 *
 * Requires `onchain:read` permission
 *
 * `utxo_selection` is not supported in LND 0.17.5 and below
 */
export const getChainFeeEstimate: AuthenticatedLightningMethod<
  GetChainFeeEstimateArgs,
  GetChainFeeEstimateResult
>;
