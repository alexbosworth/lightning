import * as events from 'events';
import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {subscribeToPay} from '../../lnd_methods/offchain/subscribe_to_pay';

const lnd = {} as AuthenticatedLnd;
const id = 'id';
const destination = 'destination';
const cltv_delta = 1;
const request = 'request';

// @ts-expect-error
subscribeToPay();
// @ts-expect-error
subscribeToPay({});
// @ts-expect-error
subscribeToPay({lnd});
// @ts-expect-error
subscribeToPay({lnd, request, cltv_delta}); // A CLTV delta cannot be specified when request is set
// @ts-expect-error
subscribeToPay({lnd, destination}); // An id is required to pay to a destination

expectType<events.EventEmitter>()(subscribeToPay({lnd, request}));
expectType<events.EventEmitter>()(subscribeToPay({lnd, id, destination}));
