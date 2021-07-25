import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type UpdatePathfindingSettingsArgs = AuthenticatedLightningArgs<{
  /** Assumed Hop Forward Chance In 1 Million Number */
  baseline_success_rate?: number;
  /** Maximum Historical Payment Records To Keep Number */
  max_payment_records?: number;
  /** Avoid Node Due to Failure Rate In 1 Million Number */
  node_ignore_rate?: number;
  /** Millisecs to Reduce Fail Penalty By Half Number */
  penalty_half_life_ms?: number;
}>;

/**
 * Update current pathfinding settings
 *
 * Requires `offchain:read`, `offchain:write` permissions
 *
 * Method not supported on LND 0.12.1 or below
 */
export const updatePathfindingSettings: AuthenticatedLightningMethod<UpdatePathfindingSettingsArgs>;
