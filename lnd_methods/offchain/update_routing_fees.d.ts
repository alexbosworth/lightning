import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';
import {MergeExclusive} from 'type-fest';

type BaseFeeTokens = MergeExclusive<
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

export type UpdateRoutingFeesFailure = {
  /** Failure Reason String */
  failure: string;
  /** Referenced Channel Is Still Pending Bool */
  is_pending_channel: boolean;
  /** Referenced Channel is Unknown Bool */
  is_unknown_channel: boolean;
  /** Policy Arguments Are Invalid Bool */
  is_invalid_policy: boolean;
  /** Funding Transaction Id Hex String */
  transaction_id: string;
  /** Funding Transaction Output Index Number */
  transaction_vout: number;
};

export type UpdateRoutingFeesResult = {
  failures?: UpdateRoutingFeesFailure[];
};

/**
 * Update routing fees on a single channel or on all channels
 *
 * Note: not setting a policy attribute will result in a minimal default used
 *
 * Setting both `base_fee_tokens` and `base_fee_mtokens` is not supported
 *
 * `failures` are not returned on LND 0.13.4 and below
 *
 * Requires `offchain:write` permission
 */
export const updateRoutingFees: AuthenticatedLightningMethod<
  UpdateRoutingFeesArgs,
  UpdateRoutingFeesResult
>;
