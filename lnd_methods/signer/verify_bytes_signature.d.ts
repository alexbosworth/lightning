import {AuthenticatedLndMethod} from '../../typescript';

export type VerifyBytesSignatureArgs = {
  /** Message Preimage Bytes Hex Encoded String */
  preimage: string;
  /** Signature Valid For Public Key Hex String */
  public_key: string;
  /** Signature Hex */
  signature: string;
};

export type VerifyBytesSignatureResult = {
  /** Signature is Valid */
  is_valid: boolean;
};

/**
 * Verify signature of arbitrary bytes
 *
 * Requires LND built with `signrpc` build tag
 *
 * Requires `signer:read` permission
 */
export const verifyBytesSignature: AuthenticatedLndMethod<
  VerifyBytesSignatureArgs,
  VerifyBytesSignatureResult
>;
