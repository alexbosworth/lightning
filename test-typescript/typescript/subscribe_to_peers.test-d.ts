import * as events from 'events';
import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {subscribeToPeers} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

expectError(subscribeToPeers());
expectError(subscribeToPeers({}));

expectType<events.EventEmitter>(subscribeToPeers({lnd}));
