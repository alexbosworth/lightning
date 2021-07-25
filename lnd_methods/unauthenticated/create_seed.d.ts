import {
  UnauthenticatedLightningArgs,
  UnauthenticatedLightningMethod,
} from '../../typescript';

export type CreateSeedArgs = UnauthenticatedLightningArgs<{
  /** Seed Passphrase String */
  passphrase?: string;
}>;

export type CreateSeedResult = {
  /** Cipher Seed Mnemonic String */
  seed: string;
};

/**
 * Create a wallet seed
 *
 * Requires unlocked lnd and unauthenticated LND
 */
export const createSeed: UnauthenticatedLightningMethod<
  CreateSeedArgs,
  CreateSeedResult
>;
