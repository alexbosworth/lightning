import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
  UtxoSelection,
} from '../../typescript';
import {MergeExclusive} from 'type-fest';

export type FundPsbtArgs = AuthenticatedLightningArgs<
  {
    /** Change Address Address Format String */
    change_format?: 'p2tr';
    /** Chain Fee Tokens Per Virtual Byte */
    fee_tokens_per_vbyte?: number;
    inputs?: {
      /** Unspent Transaction Id Hex */
      transaction_id: string;
      /** Unspent Transaction Output Index */
      transaction_vout: number;
    }[];
    /** Spend UTXOs With Minimum Confirmations */
    min_confirmations?: number;
    /** Confirmations To Wait */
    target_confirmations?: number;
    /** Select UTXOs Using Method String */
    utxo_selection?: 'largest' | 'random';
  } & MergeExclusive<
    {
      /** Existing PSBT Hex */
      psbt: string;
    },
    {
      outputs: {
        /** Chain Address */
        address: string;
        /** Send Tokens Tokens */
        tokens: number;
      }[];
    }
  >
>;

export type FundPsbtResult = {
  inputs: {
    /** UTXO Lock Expires At ISO 8601 Date */
    lock_expires_at?: string;
    /** UTXO Lock Id Hex */
    lock_id?: string;
    /** Unspent Transaction Id Hex */
    transaction_id: string;
    /** Unspent Transaction Output Index */
    transaction_vout: number;
  }[];
  outputs: {
    /** Spends To a Generated Change Output */
    is_change: boolean;
    /** Output Script Hex */
    output_script: string;
    /** Send Tokens Tokens */
    tokens: number;
  }[];
  /** Unsigned PSBT Hex */
  psbt: string;
};

/**
 * Lock and optionally select inputs to a partially signed transaction
 *
 * Specify outputs or PSBT with the outputs encoded
 *
 * If there are no inputs passed, internal UTXOs will be selected and locked
 *
 * `utxo_selection` methods: 'largest', 'random'
 *
 * `change_format` options: `p2tr` (only one change type is supported)
 *
 * Requires `onchain:write` permission
 *
 * Requires LND built with `walletrpc` tag
 *
 * This method is not supported in LND 0.11.1 and below
 *
 * Specifying 0 for `min_confirmations` is not supported in LND 0.13.0 and below
 *
 * `utxo_selection` is not supported in LND 0.17.5 and below
 */
export const fundPsbt: AuthenticatedLightningMethod<
  FundPsbtArgs,
  FundPsbtResult
>;
