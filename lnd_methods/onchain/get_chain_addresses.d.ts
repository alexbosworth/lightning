import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type GetChainAddressesArgs = AuthenticatedLightningArgs;

export type GetChainAddressesResult = {
  addresses: {
    /** Chain Address String */
    address: string;
    /** Is Internal Change Address Bool */
    is_change: boolean;
    /** Balance of Funds Controlled by Output Script Tokens Number */
    tokens: number;
  }[];
};

/**
 * Get the wallet chain addresses
 *
 * Requires `onchain:read` permission
 *
 * This method is not supported on LND 0.15.5 and below
 */
export const getChainAddresses: AuthenticatedLightningMethod<
  GetChainAddressesArgs,
  GetChainAddressesResult
>;
