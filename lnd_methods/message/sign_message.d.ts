import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type SignMessageArgs = AuthenticatedLightningArgs<{
  /** Message */
  message: string;
}>;

export type SignMessageResult = {
  /** Signature */
  signature: string;
};

/**
 * Sign a message
 *
 * Requires `message:write` permission
 */
export const signMessage: AuthenticatedLightningMethod<
  SignMessageArgs,
  SignMessageResult
>;
