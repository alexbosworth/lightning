import {AuthenticatedLightningSubscription} from '../../typescript';

export type SubscribeToBlocksBlockEvent = {
  /** Block Height */
  height: number;
  /** Block Hash */
  id: string;
};

/**
 * Subscribe to blocks
 *
 * This method will also immediately emit the current height and block id
 *
 * Requires LND built with `chainrpc` build tag
 *
 * Requires `onchain:read` permission
 */
export const subscribeToBlocks: AuthenticatedLightningSubscription;
