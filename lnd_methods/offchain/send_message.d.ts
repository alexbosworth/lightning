import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type SendMessageArgs = AuthenticatedLightningArgs<{
  inbound: {
    /** Encrypted Data Hex String */
    encrypted_data: string;
    /** Blinded Relaying Public Key Into Destination Hex String */
    relay_key: string;
  }[];
  /** Message Path Key Hex String */
  key: string;
  message?: {
    /** Message Payload Record Type Number String */
    type: string;
    /** Message Payload Hex String */
    value: string;
  };
  /** Relaying Node Public Keys Out of Source Hex Strings */
  outbound: string[];
  /** Reply Path Relaying Node Public Keys Back To Sender Hex Strings */
  reply?: string[];
}>;

export type SendMessageResult = {
  /** Reply Identifier Hex String */
  reply?: string;
};

/**
 * Send a generic message over the network
 *
 * The receiver first publishes an inbound path. Supply this via `inbound`
 * and add outbound relaying node ids that support message passing.
 *
 * This method is not supported in LND 0.20.4 and below
 */
export const sendMessage: AuthenticatedLightningMethod<
  SendMessageArgs,
  SendMessageResult
>;
