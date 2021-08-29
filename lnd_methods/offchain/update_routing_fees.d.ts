import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';
import {Xor} from '../../typescript/util';

type BaseFeeTokens = Xor<
  {
    /** Base Fee Millitokens Charged */
    base_fee_mtokens?: string;
  },
  {
    /** Base Fee Tokens Charged */
    base_fee_tokens?: number;
  }
>;

type TransactionIdAndOutputIndex =
  | {
      /** Channel Funding Transaction Id */
      transaction_id: string;
      /** Channel Funding Transaction Output Index */
      transaction_vout: number;
    }
  | {
      transaction_id?: never;
      transaction_vout?: never;
    };

export type UpdateRoutingFeesArgs = AuthenticatedLightningArgs<
  BaseFeeTokens &
    TransactionIdAndOutputIndex & {
      /** HTLC CLTV Delta */
      cltv_delta?: number;
      /** Fee Rate In Millitokens Per Million */
      fee_rate?: number;
      /** Maximum HTLC Millitokens to Forward */
      max_htlc_mtokens?: string;
      /** Minimum HTLC Millitokens to Forward */
      min_htlc_mtokens?: string;
    }
>;

/**
 * Update routing fees on a single channel or on all channels
 *
 * Note: not setting a policy attribute will result in a minimal default used
 *
 * Setting both `base_fee_tokens` and `base_fee_mtokens` is not supported
 *
 * Requires `offchain:write` permission
 */
export const updateRoutingFees: AuthenticatedLightningMethod<UpdateRoutingFeesArgs>;
