import * as events from 'events';
import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {subscribeToPeerMessages} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

expectError(subscribeToPeerMessages());
expectError(subscribeToPeerMessages({}));

expectType<events.EventEmitter>(subscribeToPeerMessages({lnd}));
