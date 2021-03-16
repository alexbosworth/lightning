import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type SignPsbtArgs = AuthenticatedLightningArgs<{
  /** Funded PSBT Hex */
  psbt: string;
}>;

export type SignPsbtResult = {
  /** Finalized PSBT Hex */
  psbt: string;
  /** Signed Raw Transaction Hex */
  transaction: string;
};

/**
 * Sign a PSBT to produce a finalized PSBT that is ready to broadcast
 *
 * Requires `onchain:write` permission
 *
 * Requires LND built with `walletrpc` tag
 *
 * This method is not supported in LND 0.11.1 and below
 */
export const signPsbt: AuthenticatedLightningMethod<
  SignPsbtArgs,
  SignPsbtResult
>;
