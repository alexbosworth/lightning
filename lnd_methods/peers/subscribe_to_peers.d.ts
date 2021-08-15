import {AuthenticatedLightningSubscription} from '../../typescript';

export type SubscribeToPeersConnectedEvent = {
  /** Connected Peer Public Key Hex String */
  public_key: string;
};

export type SubscribeToPeersDisconnectedEvent = {
  /** Disconnected Peer Public Key Hex String */
  public_key: string;
};

/**
 * Subscribe to peer connectivity events
 *
 * Requires `peers:read` permission
 */
export const subscribeToPeers: AuthenticatedLightningSubscription;
