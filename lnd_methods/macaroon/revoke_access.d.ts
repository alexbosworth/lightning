import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type RevokeAccessArgs = AuthenticatedLightningArgs<{
  /** Access Token Macaroon Root Id Positive Integer */
  id: string;
}>;

/**
 * Revoke an access token given out in the past
 *
 * Note: this method is not supported in LND versions 0.11.0 and below
 *
 * Requires `macaroon:write` permission
 */
export const revokeAccess: AuthenticatedLightningMethod<RevokeAccessArgs>;
