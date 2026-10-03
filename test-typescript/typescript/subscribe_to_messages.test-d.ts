import * as events from 'events';
import {expectType} from '../expect';
import {subscribeToMessages as subscribeToMessagesFromRoot} from '../..';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {subscribeToMessages} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

expectType<typeof subscribeToMessages>()(subscribeToMessagesFromRoot);

// @ts-expect-error
subscribeToMessages();
// @ts-expect-error
subscribeToMessages({});

expectType<events.EventEmitter>()(subscribeToMessages({lnd}));
