import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type GetChainFeeRateArgs = AuthenticatedLightningArgs<{
  /** Future Blocks Confirmation */
  confirmation_target?: number;
}>;

export type GetChainFeeRateResult = {
  /** Tokens Per Virtual Byte */
  tokens_per_vbyte: number;
};

/**
 * Get chain fee rate estimate
 *
 * Requires LND built with `walletrpc` tag
 *
 * Requires `onchain:read` permission
 */
export const getChainFeeRate: AuthenticatedLightningMethod<
  GetChainFeeRateArgs,
  GetChainFeeRateResult
>;
