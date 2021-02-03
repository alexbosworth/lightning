import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type GetForwardingConfidenceArgs = AuthenticatedLightningArgs<{
  /** From Public Key Hex */
  from: string;
  /** Millitokens To Send */
  mtokens: string;
  /** To Public Key Hex */
  to: string;
}>;

export type GetForwardingConfidenceResult = {
  /** Success Confidence Score Out Of One Million */
  confidence: number;
};

/**
 * Get the confidence in being able to send between a direct pair of nodes
 */
export const getForwardingConfidence: AuthenticatedLightningMethod<
  GetForwardingConfidenceArgs,
  GetForwardingConfidenceResult
>;
