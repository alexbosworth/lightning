import {UnauthenticatedLnd} from '../../lnd_grpc';
import {UnauthenticatedLightningMethod} from '../../typescript';

export type GetWalletStatusResult = {
  /** Is Wallet Not Created Yet */
  is_absent?: boolean;

  /** Is Wallet Currently Active */
  is_active?: boolean;

  /** Is Wallet File Encrypted */
  is_locked?: boolean;

  /** Is Wallet Starting Up */
  is_starting?: boolean;

  /** Is Wallet Waiting To Start */
  is_waiting?: boolean;
};

/**
 * Get wallet status.
 *
 * Requires `info:read` permission
 */
export const getWalletStatus: UnauthenticatedLightningMethod<
  {lnd: UnauthenticatedLnd},
  GetWalletStatusResult
>;
