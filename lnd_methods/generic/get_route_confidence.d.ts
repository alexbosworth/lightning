import {AuthenticatedLnd} from '../../lnd_grpc';
import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type GetRouteConfidenceArgs = AuthenticatedLightningArgs<{
  /** Starting Hex Serialized Public Key */
  from?: string;
  hops: {
    /** Forward Millitokens String */
    forward_mtokens: string;
    /** Forward Edge Public Key Hex String */
    public_key: string;
  }[];
}>;

export type GetRouteConfidenceResult = {
  /** Confidence Score Out Of One Million Number */
  confidence: number;
};

/**
 * Get confidence of successfully routing a payment to a destination
 *
 * Requires `offchain:read` permission
 *
 * If `from` is not set, self is default
 */
export const getRouteConfidence: AuthenticatedLightningMethod<
  GetRouteConfidenceArgs,
  GetRouteConfidenceResult
>;
