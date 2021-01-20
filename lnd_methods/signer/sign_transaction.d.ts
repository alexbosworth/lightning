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
    /** Sighash Type */
    sighash: number;
    /** Input Index To Sign */
    vin: number;
    /** Witness Script Hex String */
    witness_script: string;
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
 */
export const signTransaction: AuthenticatedLightningMethod<
  SignTransactionArgs,
  SignTransactionResult
>;
