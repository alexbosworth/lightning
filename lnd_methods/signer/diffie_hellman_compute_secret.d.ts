import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type DiffieHellmanComputeSecretArgs = AuthenticatedLightningArgs<{
  /** Key Family */
  key_family?: number;
  /** Key Index */
  key_index?: number;
  /** Public Key Hex */
  partner_public_key: string;
}>;

export type DiffieHellmanComputeSecretResult = {
  /** Shared Secret Hex */
  secret: string;
};

/**
 * Derive a shared secret
 *
 * Key family and key index default to 6 and 0, which is the node identity key
 *
 * Requires LND built with `signrpc` build tag
 *
 * Requires `signer:generate` permission
 */
export const diffieHellmanComputeSecret: AuthenticatedLightningMethod<
  DiffieHellmanComputeSecretArgs,
  DiffieHellmanComputeSecretResult
>;
