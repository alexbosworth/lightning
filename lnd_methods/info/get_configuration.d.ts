import type {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type GetConfigurationArgs = AuthenticatedLightningArgs;

export type GetConfigurationResult = {
  /** Log Line String */
  log: string[];
  options: {
    /** Option Type String */
    type: string;
    /** Option Value String */
    value: string;
  }[];
};

/**
 * Get the current configuration file settings and the output log
 *
 * Requires `info:read`, `offchain:read`, `onchain:read`, `peers:read`
  permissions
 *
 * This method is not supported on LND 0.17.5 and below
 */
export const getConfiguration: AuthenticatedLightningMethod<
  GetConfigurationArgs,
  GetConfigurationResult
>;
