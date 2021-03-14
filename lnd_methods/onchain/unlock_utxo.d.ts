import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type UnlockUtxoArgs = AuthenticatedLightningArgs<{
  /** Lock Id Hex */
  id: string;
  /** Unspent Transaction Id Hex */
  transaction_id: string;
  /** Unspent Transaction Output Index */
  transaction_vout: number;
}>;

/**
 * Unlock UTXO
 *
 * Requires `onchain:write` permission
 *
 * Requires LND built with `walletrpc` build tag
 */
export const unlockUtxo: AuthenticatedLightningMethod<UnlockUtxoArgs>;
