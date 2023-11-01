import type {MergeExclusive} from 'type-fest';
import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type GetBlockHeaderArgs = AuthenticatedLightningArgs<
  MergeExclusive<
    {
      /** Block Height Number */
      height: number;
    },
    {
      /** Block Hash Hex String */
      id: string;
    }
  >
>;

export type GetBlockHeaderResult = {
  /** Raw Block Header Bytes Hex String */
  header: string;
};

/**
 * Get a block header in the chain
 *
 * This method requires LND built with `chainrpc` build tag
 *
 * Requires `onchain:read` permission
 *
 * This method is not supported on LND 0.17.0 and below
 */
export const getBlockHeader: AuthenticatedLightningMethod<
  GetBlockHeaderArgs,
  GetBlockHeaderResult
>;
