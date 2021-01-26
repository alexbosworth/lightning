import * as events from 'events';
import {ConfirmedFromPaymentResult} from '../../lnd_responses/confirmed_from_payment';
import {FailureFromPaymentResult} from '../../lnd_responses/failure_from_payment';
import {LightningError, PaymentState} from '../../typescript';

export type EmitPaymentArgs = {
  data: {
    status: PaymentState;
  };
  emitter: events.EventEmitter;
};

export type EmitPaymentConfirmedEvent = ConfirmedFromPaymentResult;

export type EmitPaymentFailedEvent = FailureFromPaymentResult;

export type EmitPaymentPayingEvent = {[key: string]: never};

export type EmitPaymentError = LightningError<never>;

export const emitPayment: (args: EmitPaymentArgs) => boolean | undefined;
