import * as events from 'events';
import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {subscribeToTransactions} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

expectError(subscribeToTransactions());
expectError(subscribeToTransactions({}));

expectType<events.EventEmitter>(subscribeToTransactions({lnd}));
