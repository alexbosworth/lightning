import * as events from 'events';
import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {subscribeToGraph} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

expectError(subscribeToGraph());
expectError(subscribeToGraph({}));

expectType<events.EventEmitter>(subscribeToGraph({lnd}));
