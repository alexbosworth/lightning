import {AuthenticatedLnd} from '../../lnd_grpc';
import {AuthenticatedLightningMethod} from '../../typescript';

export type GetAccessIdsResult = {
  /** Root Access Id Numbers */
  ids: number[];
};

/**
 * Get outstanding access ids given out
 *
 * Note: this method is not supported in LND versions 0.11.1 and below
 *
 * Requires `macaroon:read` permission
 */
export const getAccessIds: AuthenticatedLightningMethod<
  {lnd: AuthenticatedLnd},
  GetAccessIdsResult
>;
