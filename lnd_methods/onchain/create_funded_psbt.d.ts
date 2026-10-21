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
    bip32_derivations?: Array<{
      /** Public Key Fingerprint Hex String */
      fingerprint: string;
      /** Taproot Leaf Hash Hex Strings */
      leaf_hashes?: string[];
      /** BIP 32 Derivation Path String */
      path?: string;
      /** Public Key Hex String */
      public_key: string;
    }>;
    /** Sequence Number */
    sequence?: number;
    /** Unspent Transaction Id Hex String */
    transaction_id: string;
    /** Unspent Transaction Output Index Number */
    transaction_vout: number;
    witness_utxo?: {
      /** UTXO Output Script Hex String */
      output_script: string;
      /** UTXO Tokens Number */
      tokens: number;
    };
  }>;
  /** Lock Expires At ISO 8601 Date String */
  lock_expires_at?: string;
  /** Lock Identifier Hex String */
  lock_id?: string;
  /** Maximum Fee To Total Output Value Ratio Number */
  max_fee_ratio?: number;
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
  inputs: Array<{
    /** UTXO Lock Expires At ISO 8601 Date String */
    lock_expires_at?: string;
    /** UTXO Lock Id Hex String */
    lock_id?: string;
    /** Unspent Transaction Id Hex String */
    transaction_id: string;
    /** Unspent Transaction Output Index Number */
    transaction_vout: number;
  }>;
  outputs: Array<{
    /** Is Change Output Bool */
    is_change: boolean;
    /** Output Script Hex String */
    output_script: string;
    /** Send Tokens Tokens Number */
    tokens: number;
  }>;
  /** Unsigned PSBT Hex String */
  psbt: string;
}

/**
 * Create an unsigned funded PSBT given inputs or outputs
 *
 * When specifying local inputs, they must be locked before using
 *
 * `lock_id` and `lock_expires_at` set the id and expiration of the locks on
 * the inputs that are added to fund the PSBT
 *
 * LND 0.21.4 and below need inputs from other wallets to have a
 * `witness_utxo`, and P2TR ones to also have a `bip32_derivations` entry for
 * their x-only internal key, without `leaf_hashes`
 *
 * LND 0.21.4 and below can only estimate the size of P2WPKH, nested P2WPKH
 * and P2TR key spend inputs
 *
 * Inputs with a `witness_utxo` that are not P2TR are set to sign with
 * SIGHASH_ALL, since LND 0.21.4 and below otherwise sign them with an invalid
 * sighash type
 *
 * A fractional `fee_tokens_per_vbyte` is rounded up to whole tokens per 1000
 * weight units
 *
 * `max_fee_ratio` is the highest fee to total output value ratio to allow.
 * LND 0.21.4 and below use 0.2 when it is not set, and allow at most 1
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
 *
 * `lock_expires_at`, `lock_id`, `max_fee_ratio` and a fractional
 * `fee_tokens_per_vbyte` are not supported on LND 0.18.5 or below
 */
export const createFundedPsbt: AuthenticatedLightningMethod<
  CreateFundedPsbtArgs,
  CreateFundedPsbtResult
>;
