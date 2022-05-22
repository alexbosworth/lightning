import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript/shared';

export type EndGroupSigningSessionArgs = AuthenticatedLightningArgs<{
  /** Session Id Hex String */
  id: string;
  /** Combine External Partial Signature Hex Strings */
  signatures?: string[];
}>;

export type EndGroupSigningSessionResult = {
  /** Combined Signature Hex String */
  signature?: string;
};

export const endGroupSigningSession: AuthenticatedLightningMethod<
  EndGroupSigningSessionArgs,
  EndGroupSigningSessionResult
>;
