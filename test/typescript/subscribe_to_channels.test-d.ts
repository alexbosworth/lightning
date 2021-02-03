import * as events from 'events';
import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {subscribeToChannels} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

expectError(subscribeToChannels());
expectError(subscribeToChannels({}));

expectType<events.EventEmitter>(subscribeToChannels({lnd}));
