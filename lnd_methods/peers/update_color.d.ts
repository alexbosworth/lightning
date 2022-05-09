import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript/shared';

export type UpdateColorArgs = AuthenticatedLightningArgs<{
  /** Node Color String */
  color: string;
}>;

export const updateColor: AuthenticatedLightningMethod<UpdateColorArgs>;
