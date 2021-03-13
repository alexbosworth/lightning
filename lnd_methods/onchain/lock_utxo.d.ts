import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type LockUtxoArgs = AuthenticatedLightningArgs<{
  /** Lock Identifier Hex */
  id?: string;
  /** Unspent Transaction Id Hex */
  transaction_id: string;
  /** Unspent Transaction Output Index */
  transaction_vout: number;
}>;

export type LockUtxoResult = {
  /** Lock Expires At ISO 8601 Date */
  expires_at: string;
  /** Locking Id Hex */
  id: string;
};

/**
 * Lock UTXO
 *
 * Requires `onchain:write` permission
 *
 * Requires LND built with `walletrpc` build tag
 */
export const lockUtxo: AuthenticatedLightningMethod<
  LockUtxoArgs,
  LockUtxoResult
>;
