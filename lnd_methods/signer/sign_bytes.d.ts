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
  /** BIP-340 Tagged Hash Tag UTF8 String, requires `schnorr` type */
  tag?: string;
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
 * Supported signature types: `ecdsa`, `schnorr`
 *
 * Requires LND built with `signrpc` build tag
 *
 * Requires `signer:generate` permission
 *
 * `schnorr` signature type is not supported on LND 0.15.0 and below
 *
 * `tag` is not supported on LND 0.17.5 and below and requires `schnorr` type
 */
export const signBytes: AuthenticatedLightningMethod<
  SignBytesArgs,
  SignBytesResult
>;
