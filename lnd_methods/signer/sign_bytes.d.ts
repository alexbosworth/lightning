import {AuthenticatedLndMethod} from '../../typescript';

export type SignBytesArgs = {
  /** Key Family */
  key_family: number;
  /** Key Index */
  key_index: number;
  /** Bytes To Hash and Sign Hex Encoded String */
  preimage: string;
};

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
 */
export const signBytes: AuthenticatedLndMethod<SignBytesArgs, SignBytesResult>;
