import * as events from 'events';
import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {subscribeToPeers} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

// @ts-expect-error
subscribeToPeers();
// @ts-expect-error
subscribeToPeers({});

expectType<events.EventEmitter>()(subscribeToPeers({lnd}));
