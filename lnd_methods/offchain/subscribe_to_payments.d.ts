import type {
  AuthenticatedLightningArgs,
  AuthenticatedLightningSubscription,
  LightningError,
} from '../../typescript';
import type {SubscribeToPastPaymentsPaymentEvent} from './subscribe_to_past_payments';

export type SubscribeToPaymentsArgs = AuthenticatedLightningArgs;

export type SubscribeToPaymentsErrorEvent = LightningError;

export type SubscribeToPaymentsPaymentEvent =
  SubscribeToPastPaymentsPaymentEvent;

/**
 * Subscribe to outgoing payments
 *
 * Requires `offchain:read` permission
 *
 * Note: Method not supported on LND 0.15.4 and below
 */
export const subscribeToPayments: AuthenticatedLightningSubscription<SubscribeToPaymentsArgs>;
