import * as events from 'events';
import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {subscribeToInvoices} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

expectError(subscribeToInvoices());
expectError(subscribeToInvoices({}));

expectType<events.EventEmitter>(subscribeToInvoices({lnd}));
