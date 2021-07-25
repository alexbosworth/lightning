import {
  UnauthenticatedLightningArgs,
  UnauthenticatedLightningMethod,
} from '../../typescript';

export type UnlockWalletArgs = UnauthenticatedLightningArgs<{
  /** Wallet Password String */
  password: string;
}>;

/**
 * Unlock the wallet
 */
export const unlockWallet: UnauthenticatedLightningMethod<UnlockWalletArgs>;
