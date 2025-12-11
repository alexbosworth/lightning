import * as events from 'events';
import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {subscribeToProbeForRoute} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const destination = 'destination';

expectError(subscribeToProbeForRoute());
expectError(subscribeToProbeForRoute({}));
expectError(subscribeToProbeForRoute({destination}));
expectError(subscribeToProbeForRoute({lnd}));

expectType<events.EventEmitter>(subscribeToProbeForRoute({lnd, destination}));
