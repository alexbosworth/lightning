import * as events from 'events';
import {AuthenticatedLnd, UnauthenticatedLnd} from '../lnd_grpc';

export type AuthenticatedLightningArgs<TArgs> = TArgs & {lnd: AuthenticatedLnd};
export type UnauthenticatedLightningArgs<TArgs> = TArgs & {
  lnd: UnauthenticatedLnd;
};

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
