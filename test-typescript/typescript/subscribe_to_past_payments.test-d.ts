import * as events from 'events';
import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {subscribeToPastPayments} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

// @ts-expect-error
subscribeToPastPayments();
// @ts-expect-error
subscribeToPastPayments({});

expectType<events.EventEmitter>()(subscribeToPastPayments({lnd}));
