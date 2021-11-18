import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type LightningMessage = {
  /** Message Hex String */
  message: string;
  /** To Peer Public Key Hex String */
  public_key: string;
  /** Message Type Number */
  type?: number;
};

export type SendMessageToPeerArgs =
  AuthenticatedLightningArgs<LightningMessage>;

/**
 * Send a custom message to a connected peer
 *
 * If specified, message type is expected to be between 32768 and 65535
 * Message data should not be larger than 65533 bytes
 *
 * Note: this method is not supported in LND versions 0.13.4 and below
 *
 * Requires `offchain:write` permission
 */
export const sendMessageToPeer: AuthenticatedLightningMethod<SendMessageToPeerArgs>;
