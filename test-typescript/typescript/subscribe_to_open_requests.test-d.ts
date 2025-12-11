import * as events from 'events';
import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {subscribeToOpenRequests} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

expectError(subscribeToOpenRequests());
expectError(subscribeToOpenRequests({}));

expectType<events.EventEmitter>(subscribeToOpenRequests({lnd}));
