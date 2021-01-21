import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type GetAutopilotArgs = AuthenticatedLightningArgs<{
  /** Get Score For Public Key Hex String */
  node_scores?: string[];
}>;

export type GetAutopilotResult = {
  /** Autopilot is Enabled */
  is_enabled: boolean;
  nodes: {
    /** Local-adjusted Pref Attachment Score */
    local_preferential_score: number;
    /** Local-adjusted Externally Set Score */
    local_score: number;
    /** Preferential Attachment Score */
    preferential_score: number;
    /** Node Public Key Hex String */
    public_key: string;
    /** Externally Set Score */
    score: number;
    /** Combined Weighted Locally-Adjusted Score */
    weighted_local_score: number;
    /** Combined Weighted Score */
    weighted_score: number;
  }[];
};

/**
 * Get Autopilot status
 * 
 * Optionally, get the score of nodes as considered by the autopilot.
Local scores reflect an internal scoring that includes local channel info
 * 
 * Permission `info:read` is required
 */
export const getAutopilot: AuthenticatedLightningMethod<
  GetAutopilotArgs,
  GetAutopilotResult
>;
