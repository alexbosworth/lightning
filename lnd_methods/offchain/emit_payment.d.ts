import * as events from 'events';
import {ConfirmedFromPaymentResult} from '../../lnd_responses/confirmed_from_payment';
import {FailureFromPaymentResult} from '../../lnd_responses/failure_from_payment';
import {EmptyObject, LightningError, PaymentState} from '../../typescript';

export type EmitPaymentArgs = {
  data: {
    status: PaymentState;
  };
  emitter: events.EventEmitter;
};

export type EmitPaymentConfirmedEvent = ConfirmedFromPaymentResult;

export type EmitPaymentFailedEvent = FailureFromPaymentResult;

export type EmitPaymentPayingEvent = EmptyObject;

export type EmitPaymentError = LightningError<undefined>;

export const emitPayment: (args: EmitPaymentArgs) => boolean | undefined;
