import {AuthenticatedLnd} from '../../lnd_grpc';
import {AuthenticatedLightningMethod} from '../../typescript';

export type GetNetworkCentralityResult = {
  nodes: {
    /** Betweenness Centrality */
    betweenness: number;
    /** Normalized Betweenness Centrality */
    betweenness_normalized: number;
    /** Node Public Key Hex String */
    public_key: string;
  }[];
};

/**
 * Get the graph centrality scores of the nodes on the network
 *
 * Scores are from 0 to 1,000,000.
 *
 * Requires `info:read` permission
 */
export const getNetworkCentrality: AuthenticatedLightningMethod<
  {lnd: AuthenticatedLnd},
  GetNetworkCentralityResult
>;
