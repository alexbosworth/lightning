import * as events from 'events';
import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {subscribeToForwards} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

expectError(subscribeToForwards());
expectError(subscribeToForwards({}));

expectType<events.EventEmitter>(subscribeToForwards({lnd}));
