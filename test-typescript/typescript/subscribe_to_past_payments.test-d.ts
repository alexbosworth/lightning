import * as events from 'events';
import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {subscribeToPastPayments} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

expectError(subscribeToPastPayments());
expectError(subscribeToPastPayments({}));

expectType<events.EventEmitter>(subscribeToPastPayments({lnd}));
