import {AuthenticatedLnd} from '../../lnd_grpc';
import {AuthenticatedLightningMethod} from '../../typescript';

export type GetHeightResult = {
  /** Best Chain Hash Hex String */
  current_block_hash: string;
  /** Best Chain Height */
  current_block_height: number;
};

/**
 * Lookup the current best block height
 *
 * LND with `chainrpc` build tag and `onchain:read` permission is suggested
 *
 * Otherwise, `info:read` permission is require
 */
export const getHeight: AuthenticatedLightningMethod<
  {lnd: AuthenticatedLnd},
  GetHeightResult
>;
