import {AuthenticatedLnd} from '../../lnd_grpc';
import {AuthenticatedLightningMethod} from '../../typescript/shared';

export type GetPeersResult = {
  peers: {
    /** Bytes Received */
    bytes_received: number;
    /** Bytes Sent */
    bytes_sent: number;
    features: {
      /** BOLT 09 Feature Bit */
      bit: number;
      /** Feature is Known */
      is_known: boolean;
      /** Feature Support is Required */
      is_required: boolean;
      /** Feature Type */
      type: string;
    }[];
    /** Is Inbound Peer */
    is_inbound: boolean;
    /** Is Syncing Graph Data */
    is_sync_peer?: boolean;
    /** Peer Last Reconnected At ISO 8601 Date */
    last_reconnection?: string;
    /** Ping Latency Milliseconds */
    ping_time: number;
    /** Node Identity Public Key */
    public_key: string;
    /** Count of Reconnections Over Time */
    reconnection_rate?: number;
    /** Network Address And Port */
    socket: string;
    /** Amount Received Tokens */
    tokens_received: number;
    /** Amount Sent Tokens */
    tokens_sent: number;
  }[];
};

/**
 * Get connected peers.
 *
 * Requires `peers:read` permission
 *
 * LND 0.11.1 and below do not return `last_reconnected` or `reconnection_rate
 */
export const getPeers: AuthenticatedLightningMethod<
  {lnd: AuthenticatedLnd},
  GetPeersResult
>;
