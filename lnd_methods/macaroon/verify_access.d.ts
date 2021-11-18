import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type VerifyAccessArgs = AuthenticatedLightningArgs<{
  /** Base64 Encoded Macaroon String */
  macaroon: string;
  /** Entity:Action String */
  permissions: string[];
}>;

export type VerifyAccessResult = {
  /** Access Token is Valid For Described Permissions Bool */
  is_valid: boolean;
};

/**
 * Verify an access token has a given set of permissions
 *
 * Note: this method is not supported in LND versions 0.13.4 and below
 *
 * Requires `macaroon:read` permission
 */
export const verifyAccess: AuthenticatedLightningMethod<
  VerifyAccessArgs,
  VerifyAccessResult
>;
