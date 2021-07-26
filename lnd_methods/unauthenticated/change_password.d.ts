import {
  UnauthenticatedLightningArgs,
  UnauthenticatedLightningMethod,
} from '../../typescript';

export type ChangePasswordArgs = UnauthenticatedLightningArgs<{
  /** Current Password String */
  current_password: string;
  /** New Password String */
  new_password: string;
}>;

/**
 * Change wallet password
 *
 * Requires locked LND and unauthenticated LND connection
 */
export const changePassword: UnauthenticatedLightningMethod<ChangePasswordArgs>;
