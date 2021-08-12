import {UnauthenticatedLnd} from '../../lnd_grpc';
import {UnauthenticatedLightningMethod} from '../../typescript';

export type GetWalletStatusResult = {
  "state": string;
};

/**
 * Get wallet status.
 *
 * Requires `info:read` permission
 */
export const getState: UnauthenticatedLightningMethod<
  {lnd: UnauthenticatedLnd},
  GetWalletStatusResult
>;
