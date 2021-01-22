import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type GetPublicKeyArgs = AuthenticatedLightningArgs<{
  /** Key Family */
  family: number;
  /** Key Index */
  index?: number;
}>;

export type GetPublicKeyResult = {
  /** Key Index */
  index: number;
  /** Public Key Hex String */
  public_key: string;
};

/**
 * Get a public key in the seed
 *
 * Omit a key index to cycle to the "next" key in the family
 *
 * Requires LND compiled with `walletrpc` build tag
 *
 * Requires `address:read` permission
 */
export const getPublicKey: AuthenticatedLightningMethod<
  GetPublicKeyArgs,
  GetPublicKeyResult
>;
