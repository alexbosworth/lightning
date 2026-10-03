import * as events from 'events';
import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {subscribeToForwardRequests} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

// @ts-expect-error
subscribeToForwardRequests();
// @ts-expect-error
subscribeToForwardRequests({});

expectType<events.EventEmitter>()(subscribeToForwardRequests({lnd}));
