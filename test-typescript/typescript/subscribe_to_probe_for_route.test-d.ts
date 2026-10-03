import * as events from 'events';
import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {subscribeToProbeForRoute} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const destination = 'destination';
const outgoing_channels = ['0x0x1', '0x0x2'];
const paths = [
  {
    base_fee_mtokens: '1',
    cltv_delta: 1,
    fee_rate: 1,
    hops: [{encrypted_data: '00', relay_key: 'relay_key'}],
    key: 'key',
  },
];

// @ts-expect-error
subscribeToProbeForRoute();
// @ts-expect-error
subscribeToProbeForRoute({});
// @ts-expect-error
subscribeToProbeForRoute({destination});
// @ts-expect-error
subscribeToProbeForRoute({paths});
// @ts-expect-error
subscribeToProbeForRoute({lnd});
// @ts-expect-error
subscribeToProbeForRoute({lnd, destination, outgoing_channels: '0x0x1'});

expectType<events.EventEmitter>()(subscribeToProbeForRoute({lnd, destination}));
expectType<events.EventEmitter>()(subscribeToProbeForRoute({lnd, paths}));
expectType<events.EventEmitter>()(
  subscribeToProbeForRoute({lnd, destination, paths})
);
expectType<events.EventEmitter>()(
  subscribeToProbeForRoute({lnd, destination, outgoing_channels})
);
