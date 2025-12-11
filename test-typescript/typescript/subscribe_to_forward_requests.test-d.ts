import * as events from 'events';
import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {subscribeToForwardRequests} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

expectError(subscribeToForwardRequests());
expectError(subscribeToForwardRequests({}));

expectType<events.EventEmitter>(subscribeToForwardRequests({lnd}));
