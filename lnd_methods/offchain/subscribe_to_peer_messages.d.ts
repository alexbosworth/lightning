import {LightningMessage} from '.';
import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningSubscription,
  LightningError,
} from '../../typescript';

export type SubscribeToPeerMessagesMessageReceivedEvent =
  Required<LightningMessage>;

/**
 * Subscribe to incoming peer messages
 *
 * Requires `offchain:read` permission
 *
 * This method is not supported in LND 0.13.4 and below
 */
export const subscribeToPeerMessages: AuthenticatedLightningSubscription;
