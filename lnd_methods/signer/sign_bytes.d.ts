import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type SignBytesArgs = AuthenticatedLightningArgs<{
  /** Key Family */
  key_family: number;
  /** Key Index */
  key_index: number;
  /** Bytes To Hash and Sign Hex Encoded String */
  preimage: string;
  /** Signature Type */
  type?: 'ecdsa' | 'schnorr';
}>;

export type SignBytesResult = {
  /** Signature Hex String */
  signature: string;
};

/**
 * Sign a sha256 hash of arbitrary bytes
 *
 * Requires LND built with `signrpc` build tag
 *
 * Requires `signer:generate` permission
 *
 * `schnorr` signature type is not supported on LND 0.15.0 and below
 */
export const signBytes: AuthenticatedLightningMethod<
  SignBytesArgs,
  SignBytesResult
>;
