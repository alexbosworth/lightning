import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type VerifyChainAddressMessageArgs = AuthenticatedLightningArgs<{
  /** Chain Address String */
  address: string;
  /** Message to Verify String */
  message: string;
  /** Hex Encoded Signature String */
  signature: string;
}>;

export type VerifyChainAddressMessageResult = {
  /** Public Key Hex String */
  signed_by: string;
};

/**
 * Verify a chain address message using ECDSA
 *
 * Note: this method is not supported in LND versions 0.15.5 and below
 *
 * Requires LND built with `walletrpc` tag
 *
 * `onchain:write` permission is required
 */
export const verifyChainAddressMessage: AuthenticatedLightningMethod<
  VerifyChainAddressMessageArgs,
  VerifyChainAddressMessageResult
>;
