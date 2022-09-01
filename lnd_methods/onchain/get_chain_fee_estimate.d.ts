import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
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
 */
export const getChainFeeEstimate: AuthenticatedLightningMethod<
  GetChainFeeEstimateArgs,
  GetChainFeeEstimateResult
>;
