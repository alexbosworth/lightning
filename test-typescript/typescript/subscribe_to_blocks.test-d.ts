import * as events from 'events';
import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {subscribeToBlocks} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

// @ts-expect-error
subscribeToBlocks();
// @ts-expect-error
subscribeToBlocks({});

expectType<events.EventEmitter>()(subscribeToBlocks({lnd}));
