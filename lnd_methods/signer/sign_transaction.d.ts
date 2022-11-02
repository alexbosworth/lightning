import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type SignTransactionArgs = AuthenticatedLightningArgs<{
  inputs: {
    /** Key Family */
    key_family: number;
    /** Key Index */
    key_index: number;
    /** Output Script Hex String */
    output_script: string;
    /** Output Tokens */
    output_tokens: number;
    /** Taproot Root Hash Hex String */
    root_hash?: string;
    /** Sighash Type */
    sighash: number;
    /** Input Index To Sign */
    vin: number;
    /** Witness Script Hex String */
    witness_script?: string;
  }[];
  spending?: {
    /** Non-Internal Spend Output Script Hex String */
    output_script: string;
    /** Non-Internal Spend Output Tokens Number */
    output_tokens: number;
  }[];
  /** Unsigned Transaction Hex String */
  transaction: string;
}>;

export type SignTransactionResult = {
  /** Signature Hex Strings */
  signatures: string[];
};

/**
 * Sign transaction
 *
 * Requires LND built with `signrpc` build tag
 *
 * Requires `signer:generate` permission
 *
 * `spending` is not supported in LND 0.14.5 and below
 */
export const signTransaction: AuthenticatedLightningMethod<
  SignTransactionArgs,
  SignTransactionResult
>;
