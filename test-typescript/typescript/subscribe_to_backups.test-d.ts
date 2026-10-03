import * as events from 'events';
import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {subscribeToBackups} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

// @ts-expect-error
subscribeToBackups();
// @ts-expect-error
subscribeToBackups({});

expectType<events.EventEmitter>()(subscribeToBackups({lnd}));
