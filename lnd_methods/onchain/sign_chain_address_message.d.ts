import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type SignChainAddressMessageArgs = AuthenticatedLightningArgs<{
  /** Chain Address String */
  address: string;
  /** Message To Sign String */
  message: string;
}>;

export type SignChainAddressMessageResult = {
  /** Hex Encoded Signature String */
  signature: string;
};

/**
 * Sign a chain address message using ECDSA
 *
 * Note: this method is not supported in LND versions 0.15.5 and below
 *
 * Requires LND built with `walletrpc` tag
 *
 * `onchain:write` permission is required
 */
export const signChainAddressMessage: AuthenticatedLightningMethod<
  SignChainAddressMessageArgs,
  SignChainAddressMessageResult
>;
