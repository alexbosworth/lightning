import * as events from 'events';
import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {subscribeToGraph} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

// @ts-expect-error
subscribeToGraph();
// @ts-expect-error
subscribeToGraph({});

expectType<events.EventEmitter>()(subscribeToGraph({lnd}));
