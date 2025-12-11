import * as events from 'events';
import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {
  subscribeToPayViaRoutes,
  SubscribeToPayViaRoutesArgs,
} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const routes: SubscribeToPayViaRoutesArgs['routes'] = [
  {
    fee: 1,
    fee_mtokens: '1000',
    hops: [
      {
        channel: '0x0x1',
        channel_capacity: 1,
        fee: 1,
        forward: 1,
        fee_mtokens: '1',
        forward_mtokens: '1',
        public_key: 'public_key',
        timeout: 1,
      },
    ],
    mtokens: '1',
    tokens: 1,
    timeout: 1,
  },
];
const id = Buffer.alloc(32).toString('hex');

expectError(subscribeToPayViaRoutes());
expectError(subscribeToPayViaRoutes({}));
expectError(subscribeToPayViaRoutes({routes}));
expectError(subscribeToPayViaRoutes({lnd}));

expectType<events.EventEmitter>(subscribeToPayViaRoutes({lnd, routes}));
expectType<events.EventEmitter>(subscribeToPayViaRoutes({lnd, id, routes}));
