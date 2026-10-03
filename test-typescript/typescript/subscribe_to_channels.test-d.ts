import * as events from 'events';
import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {subscribeToChannels} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

// @ts-expect-error
subscribeToChannels();
// @ts-expect-error
subscribeToChannels({});

expectType<events.EventEmitter>()(subscribeToChannels({lnd}));
