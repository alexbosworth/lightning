import * as events from 'events';
import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {subscribeToInvoice} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const id = '00';

expectError(subscribeToInvoice());
expectError(subscribeToInvoice({}));
expectError(subscribeToInvoice({id}));
expectError(subscribeToInvoice({lnd}));

expectType<events.EventEmitter>(subscribeToInvoice({lnd, id}));
