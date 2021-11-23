import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';
import {MergeExclusive} from 'type-fest';

export type SendToChainOutputScriptsArgs = AuthenticatedLightningArgs<{
  /** Transaction Label String */
  description?: string;
  /** Chain Fee Tokens Per Virtual Byte Number */
  fee_tokens_per_vbyte?: number;
  send_to: {
    /** Output Script Hex String */
    script: string;
    /** Tokens Number */
    tokens: number;
  }[];
  /** Minimum Confirmations for UTXO Selection Number */
  utxo_confirmations?: number;
}>;

export type SendToChainOutputScriptsResult = {
  /** Total Confirmations Number */
  confirmation_count: number;
  /** Transaction Id Hex String */
  id: string;
  /** Transaction Is Confirmed Bool */
  is_confirmed: boolean;
  /** Transaction Is Outgoing Bool */
  is_outgoing: boolean;
  /** Transaction Tokens Number */
  tokens: number;
  /** Raw Transaction Hex String */
  transaction: string;
};

/**
 * Send on-chain funds to multiple output scripts
 *
 * Requires `onchain:write` permission
 *
 * Requires LND compiled with `walletrpc` build tag
 */
export const sendToChainOutputScripts: AuthenticatedLightningMethod<
  SendToChainOutputScriptsArgs,
  SendToChainOutputScriptsResult
>;
