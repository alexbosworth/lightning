import {AuthenticatedTapd} from '../tapd_grpc';
import {GenericMethod} from './shared';

export type AuthenticatedTapdArgs<TArgs = undefined> =
  TArgs extends undefined
    ? {tapd: AuthenticatedTapd}
    : TArgs & {tapd: AuthenticatedTapd};

export type AuthenticatedTapdMethod<
  TArgs extends {tapd: AuthenticatedTapd} = {tapd: AuthenticatedTapd},
  TResult = void,
  TErrorDetails = any,
> = GenericMethod<TArgs, TResult, TErrorDetails>;
