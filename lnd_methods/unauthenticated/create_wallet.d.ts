import {
  UnauthenticatedLightningArgs,
  UnauthenticatedLightningMethod,
} from '../../typescript';

export type CreateWalletArgs = UnauthenticatedLightningArgs<{
  /** AEZSeed Encryption Passphrase String */
  passphrase?: string;
  /** Wallet Password String */
  password: string;
  /** Seed Mnemonic String */
  seed: string;
}>;

export type CreateWalletResult = {
  /** Base64 Encoded Admin Macaroon String */
  macaroon: string;
};

/**
 * Create a wallet
 *
 * Requires unlocked lnd and unauthenticated LND
 */
export const createWallet: UnauthenticatedLightningMethod<
  CreateWalletArgs,
  CreateWalletResult
>;
