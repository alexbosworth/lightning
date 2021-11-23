import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningSubscription,
} from '../../typescript';
import {
  SubscribeToPayConfirmedEvent,
  SubscribeToPayFailedEvent,
  SubscribeToPayOptionsArgs,
  SubscribeToPayPayingEvent,
  SubscribeToPayWithRequestArgs,
  SubscribeToRoutingFailureEvent,
} from './subscribe_to_pay';

export type SubscribeToPayViaRequestArgs = AuthenticatedLightningArgs<
  SubscribeToPayWithRequestArgs &
    Omit<SubscribeToPayOptionsArgs, 'omit' | 'routes'>
>;

export type SubscribeToPayViaRequestConfirmedEvent = Omit<
  SubscribeToPayConfirmedEvent,
  'paths'
>;

export type SubscribeToPayViaRequestFailedEvent = SubscribeToPayFailedEvent;

export type SubscribeToPayViaRequestPayingEvent = SubscribeToPayPayingEvent;

export type SubscribeToPayViaRequestRoutingFailureEvent =
  SubscribeToRoutingFailureEvent;

/**
 * Initiate and subscribe to the outcome of a payment request
 *
 * Requires `offchain:write` permission
 *
 * `max_path_mtokens` is not supported in LND 0.12.0 or below
 *
 */
export const subscribeToPayViaRequest: AuthenticatedLightningSubscription<SubscribeToPayViaRequestArgs>;
