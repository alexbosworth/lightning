import * as events from 'events';
import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {subscribeToBackups} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

expectError(subscribeToBackups());
expectError(subscribeToBackups({}));

expectType<events.EventEmitter>(subscribeToBackups({lnd}));
