import * as events from 'events';
import {MergeExclusive} from 'type-fest';
import {AuthenticatedLnd, UnauthenticatedLnd} from '../lnd_grpc';

export type EmptyObject = {[key: string]: never};

export type AuthenticatedLightningArgs<TArgs = undefined> =
  TArgs extends undefined
    ? {lnd: AuthenticatedLnd}
    : TArgs & {lnd: AuthenticatedLnd};
export type UnauthenticatedLightningArgs<TArgs = undefined> =
  TArgs extends undefined
    ? {lnd: UnauthenticatedLnd}
    : TArgs & {lnd: UnauthenticatedLnd};

export type LightningError<TError = {err: Error}> = TError extends undefined
  ? [number, string]
  : [number, string, TError];

export type LightningCallback<TResult = void, TErrorDetails = any> = (
  error: LightningError<TErrorDetails> | undefined | null,
  result: TResult extends void ? undefined : TResult
) => void;

export type LightningMethod<
  TArgs = EmptyObject,
  TResult = void,
  TErrorDetails = any
> = {
  (args: TArgs): Promise<TResult>;
  (args: TArgs, callback: LightningCallback<TResult, TErrorDetails>): void;
};

export type AuthenticatedLightningMethod<
  TArgs extends {lnd: AuthenticatedLnd} = {lnd: AuthenticatedLnd},
  TResult = void,
  TErrorDetails = any
> = LightningMethod<TArgs, TResult, TErrorDetails>;

export type UnauthenticatedLightningMethod<
  TArgs extends {lnd: UnauthenticatedLnd} = {lnd: UnauthenticatedLnd},
  TResult = void,
  TErrorDetails = any
> = LightningMethod<TArgs, TResult, TErrorDetails>;

export type AuthenticatedLightningSubscription<
  TArgs extends {lnd: AuthenticatedLnd} = {lnd: AuthenticatedLnd}
> = (args: TArgs) => events.EventEmitter;

export type UnauthenticatedLightningSubscription<
  TArgs extends {lnd: UnauthenticatedLnd} = {lnd: UnauthenticatedLnd}
> = (args: TArgs) => events.EventEmitter;

type CommonStatus = 'IN_FLIGHT' | 'SUCCEEDED' | 'FAILED';

export type AttemptState = CommonStatus;

export type CommitmentType = 'ANCHORS' | 'STATIC_REMOTE_KEY' | 'LEGACY';

export type FailureReason =
  | 'FAILURE_REASON_INCORRECT_PAYMENT_DETAILS'
  | 'FAILURE_REASON_INSUFFICIENT_BALANCE'
  | 'FAILURE_REASON_TIMEOUT'
  | 'FAILURE_REASON_NO_ROUTE'
  | 'FAILURE_REASON_NONE';

export type HtlcState = 'ACCEPTED' | 'CANCELED' | 'SETTLED';
export type HtlcStatus = CommonStatus;
export type HtlcType = 'FORWARD' | 'RECEIVE' | 'SEND';

export type ResolutionOutcome = 'CLAIMED' | 'FIRST_STAGE' | 'TIMEOUT';
export type ResolutionType = 'COMMIT' | 'INCOMING_HTLC' | 'OUTGOING_HTLC';

export type SyncType = 'ACTIVE_SYNC' | 'PASSIVE_SYNC';

export type ForwardPaymentAction = 'RESUME' | 'FAIL' | 'SETTLE';

export type PaymentState =
  | CommonStatus
  | 'FAILED_ERROR'
  | 'FAILED_INSUFFICIENT_BALANCE'
  | 'FAILED_INCORRECT_PAYMENT_DETAILS'
  | 'FAILED_NO_ROUTE'
  | 'FAILED_TIMEOUT';
export type PaymentStatus = CommonStatus | 'UNKNOWN';

export type PaginationArgs = MergeExclusive<
  {
    /** Page Result Limit */
    limit?: number;
  },
  {
    /** Opaque Paging Token */
    token?: string;
  }
>;
