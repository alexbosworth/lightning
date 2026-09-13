import {AuthenticatedLightningSubscription} from '../../typescript';

export type SubscribeToMessagesMessageReceivedEvent = {
  /** Encrypted Data Hex String */
  encrypted: string;
  /** Path Key Hex String */
  key: string;
  message?: {
    /** Message Payload Record Type Number String */
    type: string;
    /** Message Payload Hex String */
    value: string;
  };
  /** Onion Packet Hex String */
  onion: string;
  reply?: {
    inbound: {
      /** Encrypted Data Hex String */
      encrypted_data: string;
      /** Blinded Relay Key Hex String */
      relay_key: string;
    }[];
    /** Introduction Node Edge Format Channel Id String */
    introduction_edge?: string;
    /** Introduction Node Public Key Hex String */
    introduction_node?: string;
    /** Path Key Hex String */
    key: string;
  };
  /** Message Received Via Peer with Id Public Key Hex String */
  via: string;
};

/**
 * Subscribe to received onion messages
 *
 * Requires `offchain:read` permission
 *
 * This method is not supported in LND 0.20.4 and below
 */
export const subscribeToMessages: AuthenticatedLightningSubscription;
