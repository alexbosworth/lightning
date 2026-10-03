import * as events from 'events';
import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {subscribeToPastPayment} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const id = 'id';

// @ts-expect-error
subscribeToPastPayment();
// @ts-expect-error
subscribeToPastPayment({});
// @ts-expect-error
subscribeToPastPayment({id});
// @ts-expect-error
subscribeToPastPayment({lnd});

expectType<events.EventEmitter>()(subscribeToPastPayment({lnd, id}));
