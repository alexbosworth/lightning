import * as events from 'events';
import {expectError, expectType} from 'tsd';
import {subscribeToMessages as subscribeToMessagesFromRoot} from '../..';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {subscribeToMessages} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

expectType<typeof subscribeToMessages>(subscribeToMessagesFromRoot);

expectError(subscribeToMessages());
expectError(subscribeToMessages({}));

expectType<events.EventEmitter>(subscribeToMessages({lnd}));
