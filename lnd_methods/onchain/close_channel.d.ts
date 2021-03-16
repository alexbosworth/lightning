import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';
import {Xor} from '../../typescript/util';

type ExpectedIdOfChannelToClose = Xor<
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

type UnexpectedTokensPerVbyteForChannelClose = Xor<
  {
    /** Confirmation Target Number */
    target_confirmations?: number;
  },
  {
    /** Tokens Per Virtual Byte Number */
    tokens_per_vbyte?: number;
  }
>;

type ExpectedBothPublicKeyAndSocketForChannelClose = Xor<
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
  } & ExpectedBothPublicKeyAndSocketForChannelClose &
    UnexpectedTokensPerVbyteForChannelClose
>;

export type CloseChannelArgs = Xor<ForceCloseChannelArgs, CoopCloseChannelArgs>;

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
