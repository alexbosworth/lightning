import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';
import {MergeExclusive} from 'type-fest';

export type RequestChainFeeIncreaseArgs = AuthenticatedLightningArgs<
  {
    /** Unconfirmed UTXO Transaction Id Hex String */
    transaction_id: string;
    /** Unconfirmed UTXO Transaction Index Number */
    transaction_vout: number;
  } & MergeExclusive<
    {
      /** Chain Fee Tokens Per Virtual Byte Number */
      fee_tokens_per_vbyte: number;
    },
    {
      /** Confirmations To Wait Number */
      target_confirmations: number;
    }
  >
>;

/**
 * Request a future on-chain CPFP fee increase for an unconfirmed UTXO
 *
 * Requires `onchain:write` permission
 *
 * Requires LND built with `walletrpc` build tag
 */
export const requestChainFeeIncrease: AuthenticatedLightningMethod<RequestChainFeeIncreaseArgs>;
