import {AuthenticatedLnd} from '../../lnd_grpc';
import {AuthenticatedLightningMethod} from '../../typescript';

export type GetForwardingReputationsResult = {
  nodes: {
    peers: {
      /** Failed to Forward Tokens */
      failed_tokens?: number;
      /** Forwarded Tokens */
      forwarded_tokens?: number;
      /** Failed Forward At ISO-8601 Date */
      last_failed_forward_at?: string;
      /** Forwarded At ISO 8601 Date */
      last_forward_at?: string;
      /** To Public Key Hex */
      to_public_key: string;
    }[];
    /** Node Identity Public Key Hex */
    public_key: string;
  }[];
};

/**
 * Get the set of forwarding reputations
 *
 * Requires `offchain:read` permission
 */
export const getForwardingReputations: AuthenticatedLightningMethod<
  {lnd: AuthenticatedLnd},
  GetForwardingReputationsResult
>;
