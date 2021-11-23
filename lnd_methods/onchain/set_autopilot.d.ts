import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';
import {MergeExclusive} from 'type-fest';

export type CandidateNode = {
  /** Node Public Key Hex */
  public_key: string;
  /** Score */
  score: number;
};

type ExpectedNodesOrEnabledSettingToAdjustAutopilot =
  | {
      candidate_nodes: CandidateNode[];
      is_enabled?: true;
    }
  | {
      candidate_nodes?: CandidateNode[];
      is_enabled: true;
    };

export type SetAutopilotArgs = AuthenticatedLightningArgs<
  MergeExclusive<
    ExpectedNodesOrEnabledSettingToAdjustAutopilot,
    {is_enabled: false}
  >
>;

/**
 * Configure Autopilot settings
 *
 * Either `candidate_nodes` or `is_enabled` is required
 *
 * Candidate node scores range from 1 to 100,000,000
 *
 * Permissions `info:read`, `offchain:write`, `onchain:write` are required
 */
export const setAutopilot: AuthenticatedLightningMethod<SetAutopilotArgs>;
