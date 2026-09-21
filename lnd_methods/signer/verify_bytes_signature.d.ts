import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type VerifyBytesSignatureArgs = AuthenticatedLightningArgs<{
  /** Message Preimage Bytes Hex Encoded String */
  preimage: string;
  /** Signature Valid For Public Key Hex String */
  public_key: string;
  /** Signature Hex */
  signature: string;
  /** BIP-340 Tagged Hash Tag UTF8 String */
  tag?: string;
}>;

export type VerifyBytesSignatureResult = {
  /** Signature is Valid */
  is_valid: boolean;
};

/**
 * Verify signature of arbitrary bytes
 *
 * When passing a schnorr signature, a BIP-340 x-only public key should be given
 *
 * Requires LND built with `signrpc` build tag
 *
 * Requires `signer:read` permission
 *
 * Validating `schnorr` signatures is unsupported in LND 0.15.0 and below
 *
 * `tag` is not supported on LND 0.17.5 and below
 */
export const verifyBytesSignature: AuthenticatedLightningMethod<
  VerifyBytesSignatureArgs,
  VerifyBytesSignatureResult
>;
