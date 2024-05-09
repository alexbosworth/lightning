import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type GetPendingSweepsArgs = AuthenticatedLightningArgs;

export interface Sweep {
  /** Total Sweep Broadcast Attempts Count Number */
  broadcasts_count: number;
  /** Current Chain Fee Rate Tokens Per VByte Number */
  current_fee_rate?: number;
  /** Requested Chain Fee Rate Tokens per VByte Number */
  initial_fee_rate?: number;
  /** Requested Waiting For Batching Bool */
  is_batching: boolean;
  /** Maximum Total Fee Tokens Allowed Number */
  max_fee?: number;
  /** Targeted Maximum Confirmation Height Number */
  max_height?: number;
  /** Sweep Outpoint Tokens Value Number */
  tokens: number;
  /** Sweeping Outpoint Transaction Id Hex String */
  transaction_id: string;
  /** Sweeping Outpoint Transaction Output Index Number */
  transaction_vout: number;
  /** Outpoint Constraint Script Type String */
  type: string;
}

export interface GetPendingSweepsResult {
  sweeps: Sweep[];
}

/**
 * Get pending self-transfer spends
 *
 * Requires `onchain:read` permission
 *
 * Requires LND built with `walletrpc` build tag
 *
 * This method is not supported in LND 0.17.5 or below
 */
export const getPendingSweeps: AuthenticatedLightningMethod<
  GetPendingSweepsArgs,
  GetPendingSweepsResult
>;
