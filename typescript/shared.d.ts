import * as events from 'events';
import {AuthenticatedLnd, UnauthenticatedLnd} from '../lnd_grpc';

export type LightningError<TDetails = any> = [number, string, TDetails];

export type LightningCallback<TResult = void, TErrorDetails = any> = (
  error: LightningError<TErrorDetails> | undefined | null,
  result: TResult extends void ? undefined : TResult
) => void;

export type LightningMethod<
  TArgs = {[key: string]: never},
  TResult = void,
  TErrorDetails = any
> = {
  (args: TArgs): Promise<TResult>;
  (args: TArgs, callback: LightningCallback<TResult, TErrorDetails>): void;
};

export type AuthenticatedLndMethod<
  TArgs = {[key: string]: never},
  TResult = void,
  TErrorDetails = any
> = LightningMethod<TArgs & {lnd: AuthenticatedLnd}, TResult, TErrorDetails>;

export type UnauthenticatedLndMethod<
  TArgs = {[key: string]: never},
  TResult = void,
  TErrorDetails = any
> = LightningMethod<TArgs & {lnd: UnauthenticatedLnd}, TResult, TErrorDetails>;

export type AuthenticatedLndSubscription<TArgs = {[key: string]: never}> = (
  args: TArgs & {lnd: AuthenticatedLnd}
) => events.EventEmitter;
