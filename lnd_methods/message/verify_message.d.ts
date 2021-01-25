import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type VerifyMessageArgs = AuthenticatedLightningArgs<{
  /** Message */
  message: string;
  /** Signature Hex */
  signature: string;
}>;

export type VerifyMessageResult = {
  /** Public Key Hex */
  signed_by: string;
};

/**
 * Verify a message was signed by a known pubkey
 *
 * Requires `message:read` permission
 */
export const verifyMessage: AuthenticatedLightningMethod<
  VerifyMessageArgs,
  VerifyMessageResult
>;
