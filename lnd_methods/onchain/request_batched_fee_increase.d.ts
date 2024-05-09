import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type RequestBatchedFeeIncreaseArgs = AuthenticatedLightningArgs<{
  /** Maximum Tokens to Pay Into Chain Fees Number */
  max_fee?: number;
  /** Maximum Height To Reach a Confirmation Number */
  max_height?: number;
  /** Unconfirmed UTXO Transaction Id Hex String */
  transaction_id: string;
  /** Unconfirmed UTXO Transaction Index Number */
  transaction_vout: number;
}>;

/**
 * Request batched CPFP fee bumping of an unconfirmed outpoint on a deadline
 *
 * Requires `onchain:write` permission
 *
 * Requires LND built with `walletrpc` build tag
 *
 * This method is unsupported on LND 0.17.5 and below
 */
export const requestBatchedFeeIncrease: AuthenticatedLightningMethod<RequestBatchedFeeIncreaseArgs>;
