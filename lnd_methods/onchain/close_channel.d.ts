import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';
import {Xor} from '../../typescript/util';

export type CloseChannelArgs = AuthenticatedLightningArgs<{
  /** Request Sending Local Channel Funds To Address */
  address?: string;
  /** Standard Format Channel Id */
  id?: string;
  /** Is Force Close */
  is_force_close?: boolean;
  /** Peer Public Key */
  public_key?: string;
  /** Peer Socket */
  socket?: string;
  /** Confirmation Target */
  target_confirmations?: number;
  /** Tokens Per Virtual Byte */
  tokens_per_vbyte?: number;
  /** Transaction Id Hex */
  transaction_id?: string;
  /** Transaction Output Index */
  transaction_vout?: number;
}>;

export type CloseChannelResult = {
  /** Closing Transaction Id Hex */
  transaction_id: string;
  /** Closing Transaction Vout */
  transaction_vout: number;
};

/**
 * Close a channel.
 *
 * Either an id or a transaction id / transaction output index is required
 *
 * If cooperatively closing, pass a public key and socket to connect
 *
 * Requires `info:read`, `offchain:write`, `onchain:write`, `peers:write` permissions
 */
export const closeChannel: AuthenticatedLightningMethod<
  CloseChannelArgs,
  CloseChannelResult
>;
