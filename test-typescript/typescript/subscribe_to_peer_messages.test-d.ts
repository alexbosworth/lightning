import * as events from 'events';
import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {subscribeToPeerMessages} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

// @ts-expect-error
subscribeToPeerMessages();
// @ts-expect-error
subscribeToPeerMessages({});

expectType<events.EventEmitter>()(subscribeToPeerMessages({lnd}));
