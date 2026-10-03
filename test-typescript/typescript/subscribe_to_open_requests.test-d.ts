import * as events from 'events';
import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {subscribeToOpenRequests} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

// @ts-expect-error
subscribeToOpenRequests();
// @ts-expect-error
subscribeToOpenRequests({});

expectType<events.EventEmitter>()(subscribeToOpenRequests({lnd}));
