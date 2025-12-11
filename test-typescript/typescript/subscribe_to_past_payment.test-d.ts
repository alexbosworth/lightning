import * as events from 'events';
import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {subscribeToPastPayment} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const id = 'id';

expectError(subscribeToPastPayment());
expectError(subscribeToPastPayment({}));
expectError(subscribeToPastPayment({id}));
expectError(subscribeToPastPayment({lnd}));

expectType<events.EventEmitter>(subscribeToPastPayment({lnd, id}));
