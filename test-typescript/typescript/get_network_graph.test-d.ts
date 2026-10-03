import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getNetworkGraph, GetNetworkGraphResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

// @ts-expect-error
getNetworkGraph();
// @ts-expect-error
getNetworkGraph({});

expectType<GetNetworkGraphResult>()(await getNetworkGraph({lnd}));

expectType<void>()(
  getNetworkGraph({lnd}, (error, result) => {
    expectType<GetNetworkGraphResult>()(result);
  })
);
