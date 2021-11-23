import * as ws from 'ws';
import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
  LightningError,
} from '../../typescript';
import {MergeExclusive} from 'type-fest';

type ExpectedNoTokensSpecifiedWhenSendingAllFunds = MergeExclusive<
  {
    /** Tokens To Send */
    tokens: number;
  },
  {
    /** Send All Funds */
    is_send_all: true;
  }
>;
type ExpectedLogFunctionForChainSendSocketAnnounce = MergeExclusive<
  {
    /** Web Socket Servers */
    wss: ws.Server[];
    /** Log */
    log: (err: LightningError) => void;
  },
  {wss?: never; log?: never}
>;

export type SendToChainAddressArgs = AuthenticatedLightningArgs<
  {
    /** Destination Chain Address */
    address: string;
    /** Transaction Label */
    description?: string;
    /** Chain Fee Tokens Per Virtual Byte */
    fee_tokens_per_vbyte?: number;
    /** Confirmations To Wait */
    target_confirmations?: number;
    /** Minimum Confirmations for UTXO Selection */
    utxo_confirmations?: number;
  } & ExpectedNoTokensSpecifiedWhenSendingAllFunds &
    ExpectedLogFunctionForChainSendSocketAnnounce
>;

export type SendToChainAddressResult = {
  /** Total Confirmations */
  confirmation_count: number;
  /** Transaction Id Hex */
  id: string;
  /** Transaction Is Confirmed */
  is_confirmed: boolean;
  /** Transaction Is Outgoing */
  is_outgoing: boolean;
  /** Transaction Tokens */
  tokens: number;
};

/**
 * Send tokens in a blockchain transaction.
 *
 * Requires `onchain:write` permission
 *
 * `utxo_confirmations` is not supported on LND 0.11.1 or below
 */
export const sendToChainAddress: AuthenticatedLightningMethod<
  SendToChainAddressArgs,
  SendToChainAddressResult
>;
