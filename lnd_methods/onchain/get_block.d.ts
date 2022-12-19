import type {MergeExclusive} from 'type-fest';
import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type GetBlockArgs = AuthenticatedLightningArgs<
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

export type GetBlockResult = {
  /** Raw Block Bytes Hex String */
  block: string;
};

/**
 * Get a block in the chain
 *
 * This method requires LND built with `chainkit` build tag
 *
 * Requires `onchain:read` permission
 *
 * This method is not supported on LND 0.15.5 and below
 */
export const getBlock: AuthenticatedLightningMethod<
  GetBlockArgs,
  GetBlockResult
>;
