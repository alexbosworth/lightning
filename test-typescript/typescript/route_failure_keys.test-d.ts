import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {
  routeFailureKeys,
  RouteFailureKeysResult,
} from '../../lnd_methods/offchain/route_failure_keys';

const failure = {channel_update: {chan_id: '1'}};
const route = {
  hops: [
    {channel: 'channela', public_key: 'a'},
    {channel: 'channelb', public_key: 'b'},
  ],
};

expectError(routeFailureKeys());
expectError(routeFailureKeys({}));

expectType<RouteFailureKeysResult>(routeFailureKeys({route}));
expectType<RouteFailureKeysResult>(routeFailureKeys({failure, route}));
