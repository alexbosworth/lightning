import * as events from 'events';
import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {subscribeToBlocks} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

expectError(subscribeToBlocks());
expectError(subscribeToBlocks({}));

expectType<events.EventEmitter>(subscribeToBlocks({lnd}));
