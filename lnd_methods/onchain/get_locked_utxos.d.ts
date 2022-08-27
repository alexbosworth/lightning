import {AuthenticatedLnd} from '../../lnd_grpc';
import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type GetLockedUtxosArgs = AuthenticatedLightningArgs;

export type GetLockedUtxosResult = {
  utxos: {
    /** Lock Expires At ISO 8601 Date String */
    lock_expires_at: string;
    /** Locking Id Hex String */
    lock_id: string;
    /** Outpoint Output Script Hex */
    output_script?: string;
    /** Token Value of Outpoint */
    tokens?: number;
    /** Transaction Id Hex String */
    transaction_id: string;
    /** Transaction Output Index Number */
    transaction_vout: number;
  }[];
};

/**
 * Get locked unspent transaction outputs
 *
 * Requires `onchain:read` permission
 *
 * Requires LND built with `walletrpc` build tag
 *
 * This method is not supported on LND 0.12.1 and below
 *
 * `output_script`, `tokens` are not supported on LND 0.15.0 and below
 */
export const getLockedUtxos: AuthenticatedLightningMethod<
  GetLockedUtxosArgs,
  GetLockedUtxosResult
>;
