import type {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type GetMinimumRelayFeeArgs = AuthenticatedLightningArgs;

export interface GetMinimumRelayFeeResult {
  /** Minimum Relayable Tokens Per Virtual Byte Number */
  tokens_per_vbyte: number;
}

/**
 * Get the current minimum relay fee for the chain backend
 *
 * Requires LND built with `walletrpc` tag
 *
 * Requires `onchain:read` permission
 *
 * This method is not supported on LND 0.18.2 and below
 */
export const getMinimumRelayFee: AuthenticatedLightningMethod<
  GetMinimumRelayFeeArgs,
  GetMinimumRelayFeeResult
>;
