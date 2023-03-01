import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type GetSettlementStatusArgs = AuthenticatedLightningArgs<{
  /** Standard Format Channel Id String */
  channel: string;
  /** Payment Id Number */
  payment: number;
}>;

export type GetSettlementStatusResult = {
  /** Payment Went to Chain Bool */
  is_onchain: boolean;
  /** Payment Is Settled Into Non-HTLC Balance Bool */
  is_settled: boolean;
};

/**
 * Get the settlement status of a received HTLC
 *
 * Note: this method is not supported in LND versions 0.15.5 and below
 *
 * Requires LND running with `--store-final-htlc-resolutions` flag
 *
 * Requires `offchain:read` permissions
 */
export const getSettlementStatus: AuthenticatedLightningMethod<
  GetSettlementStatusArgs,
  GetSettlementStatusResult
>;
