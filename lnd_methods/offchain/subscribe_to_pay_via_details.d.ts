import {SetOptional} from 'type-fest';
import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningSubscription,
} from '../../typescript';
import {
  SubscribeToPayConfirmedEvent,
  SubscribeToPayFailedEvent,
  SubscribeToPayOptionsArgs,
  SubscribeToPayPayingEvent,
  SubscribeToPayWithDestinationArgs,
  SubscribeToRoutingFailureEvent,
} from './subscribe_to_pay';

export type SubscribeToPayViaDetailsArgs = AuthenticatedLightningArgs<
  SetOptional<SubscribeToPayWithDestinationArgs, 'id'> &
    SubscribeToPayOptionsArgs
>;

export type SubscribeToPayViaDetailsConfirmedEvent =
  SubscribeToPayConfirmedEvent;

export type SubscribeToPayViaDetailsFailedEvent = SubscribeToPayFailedEvent;

export type SubscribeToPayViaDetailsPayingEvent = Omit<
  SubscribeToPayPayingEvent,
  'request'
>;

export type SubscribeToPayViaDetailsRoutingFailure =
  SubscribeToRoutingFailureEvent;

/**
 * Subscribe to the flight of a payment
 *
 * Requires `offchain:write` permission
 *
 * `payment` is not supported on LND 0.11.1 and below
 */
export const subscribeToPayViaDetails: AuthenticatedLightningSubscription<SubscribeToPayViaDetailsArgs>;
