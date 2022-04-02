import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type CreateChainAddressArgs = AuthenticatedLightningArgs<{
  /** Receive Address Type */
  format?: 'np2wpkh' | 'p2tr' | 'p2wpkh';
  /** Get As-Yet Unused Address */
  is_unused?: boolean;
}>;

export type CreateChainAddressResult = {
  /** Chain Address */
  address: string;
};

/**
 * Create a new receive address.
 *
 * Requires address:write permission
 */
export const createChainAddress: AuthenticatedLightningMethod<
  CreateChainAddressArgs,
  CreateChainAddressResult
>;
