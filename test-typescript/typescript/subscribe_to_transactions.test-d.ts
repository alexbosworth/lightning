import * as events from 'events';
import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {subscribeToTransactions} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

// @ts-expect-error
subscribeToTransactions();
// @ts-expect-error
subscribeToTransactions({});

expectType<events.EventEmitter>()(subscribeToTransactions({lnd}));
