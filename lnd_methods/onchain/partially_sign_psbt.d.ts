import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type PartiallySignPsbtArgs = AuthenticatedLightningArgs<{
  /** Funded PSBT Hex String */
  psbt: string;
}>;

export type PartiallySignPsbtResult = {
  /** Partially Signed PSBT Hex String */
  psbt: string;
};

/**
 * Sign a PSBT to produce a partially signed PSBT
 *
 * Requires `onchain:write` permission
 *
 * Requires LND built with `walletrpc` tag
 *
 * This method is not supported in LND 0.14.1 and below
 */
export const partiallySignPsbt: AuthenticatedLightningMethod<
  PartiallySignPsbtArgs,
  PartiallySignPsbtResult
>;
