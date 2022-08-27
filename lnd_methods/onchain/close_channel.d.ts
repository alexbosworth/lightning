import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';
import {MergeExclusive} from 'type-fest';

type ExpectedIdOfChannelToClose = MergeExclusive<
  {
    /** Standard Format Channel Id String */
    id: string;
  },
  {
    /** Transaction Id Hex String */
    transaction_id: string;
    /** Transaction Output Index Number */
    transaction_vout: number;
  }
>;

type UnexpectedTokensPerVbyteForChannelClose = MergeExclusive<
  {
    /** Confirmation Target Number */
    target_confirmations?: number;
  },
  {
    /** Tokens Per Virtual Byte Number */
    tokens_per_vbyte?: number;
  }
>;

type ExpectedBothPublicKeyAndSocketForChannelClose = MergeExclusive<
  {
    /** Peer Public Key String */
    public_key: string;
    /** Peer Socket String */
    socket: string;
  },
  {public_key?: never; socket?: never}
>;

export type ForceCloseChannelArgs = AuthenticatedLightningArgs<
  ExpectedIdOfChannelToClose & {
    is_force_close: true;
  }
>;

export type CoopCloseChannelArgs = AuthenticatedLightningArgs<
  ExpectedIdOfChannelToClose & {
    is_force_close?: false;
    /** Request Sending Local Channel Funds To Address String */
    address?: string;
    /** Fail Cooperative Close Above Fee Rate */
    max_tokens_per_vbyte?: number;
  } & ExpectedBothPublicKeyAndSocketForChannelClose &
    UnexpectedTokensPerVbyteForChannelClose
>;

export type CloseChannelArgs = MergeExclusive<
  ForceCloseChannelArgs,
  CoopCloseChannelArgs
>;

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
 * `max_tokens_per_vbyte` will be ignored when closing a peer initiated channel
 *
 * Requires `info:read`, `offchain:write`, `onchain:write`, `peers:write` permissions
 *
 * `max_tokens_per_vbyte` is not supported in LND 0.15.0 and below
 */
export const closeChannel: AuthenticatedLightningMethod<
  CloseChannelArgs,
  CloseChannelResult
>;
