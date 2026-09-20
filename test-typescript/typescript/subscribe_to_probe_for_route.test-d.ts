import * as events from 'events';
import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {subscribeToProbeForRoute} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const destination = 'destination';
const paths = [
  {
    base_fee_mtokens: '1',
    cltv_delta: 1,
    fee_rate: 1,
    hops: [{encrypted_data: '00', relay_key: 'relay_key'}],
    key: 'key',
  },
];

expectError(subscribeToProbeForRoute());
expectError(subscribeToProbeForRoute({}));
expectError(subscribeToProbeForRoute({destination}));
expectError(subscribeToProbeForRoute({paths}));
expectError(subscribeToProbeForRoute({lnd}));

expectType<events.EventEmitter>(subscribeToProbeForRoute({lnd, destination}));
expectType<events.EventEmitter>(subscribeToProbeForRoute({lnd, paths}));
expectType<events.EventEmitter>(
  subscribeToProbeForRoute({lnd, destination, paths})
);
