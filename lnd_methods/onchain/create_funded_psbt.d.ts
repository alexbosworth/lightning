import type {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type CreateFundedPsbtArgs = AuthenticatedLightningArgs<{
  /** Change Address Address Format String */
  change_format?: 'p2tr';
  /** Chain Fee Tokens Per Virtual Byte Number */
  fee_tokens_per_vbyte?: number;
  inputs?: Array<{
    /** Sequence Number */
    sequence?: number;
    /** Unspent Transaction Id Hex String */
    transaction_id: string;
    /** Unspent Transaction Output Index Number */
    transaction_vout: number;
  }>;
  /** Select Inputs With Minimum Confirmations Number */
  min_confirmations?: number;
  outputs?: Array<{
    /** Use This Output For Change Bool */
    is_change?: boolean;
    /** Output Script Hex String> */
    script: string;
    /** Send Tokens Tokens Number */
    tokens: number;
  }>;
  /** Blocks To Wait for Confirmation Number */
  target_confirmations?: number;
  /** Spendable Lock Time on Transaction Number */
  timelock?: number;
  /** Select Inputs Using Selection Methodology Type String */
  utxo_selection?: 'largest' | 'random';
  /** Transaction Version Number */
  version?: number;
}>;

export interface CreateFundedPsbtResult {
  /** Unsigned PSBT Hex String */
  psbt: string;
}

/**
 * Create an unsigned funded PSBT given inputs or outputs
 *
 * When specifying local inputs, they must be locked before using
 *
 * `utxo_selection` methods: 'largest', 'random'
 *
 * `change_format` options: `p2tr` (only one change type is supported)
 *
 * Requires `onchain:write` permission
 *
 * Requires LND built with `walletrpc` tag
 *
 * This method is not supported on LND 0.17.5 or below
 */
export const createFundedPsbt: AuthenticatedLightningMethod<
  CreateFundedPsbtArgs,
  CreateFundedPsbtResult
>;
