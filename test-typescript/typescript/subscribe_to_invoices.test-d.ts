import * as events from 'events';
import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {subscribeToInvoices} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const added_after = 0;
const confirmed_after = 0;
const restart_delay_ms = 0;

expectError(subscribeToInvoices());
expectError(subscribeToInvoices({}));

expectType<events.EventEmitter>(subscribeToInvoices({lnd}));
expectType<events.EventEmitter>(subscribeToInvoices({lnd, added_after}));
expectType<events.EventEmitter>(subscribeToInvoices({lnd, confirmed_after}));
expectType<events.EventEmitter>(subscribeToInvoices({lnd, restart_delay_ms}));
