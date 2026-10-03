import * as events from 'events';
import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {subscribeToForwards} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

// @ts-expect-error
subscribeToForwards();
// @ts-expect-error
subscribeToForwards({});

expectType<events.EventEmitter>()(subscribeToForwards({lnd}));
