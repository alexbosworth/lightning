import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript/shared';

export type UpdateGroupSigningSessionArgs = AuthenticatedLightningArgs<{
  /** Hash to Sign Hex String */
  hash: string;
  /** MuSig2 Session Id Hex String */
  id: string;
  /** Nonce Hex Strings */
  nonces: string[];
}>;

export type UpdateGroupSigningSessionResult = {
  /** Partial Signature Hex String */
  signature: string;
};

export const updateGroupSigningSession: AuthenticatedLightningMethod<
  UpdateGroupSigningSessionArgs,
  UpdateGroupSigningSessionResult
>;
