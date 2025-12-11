import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getNetworkGraph, GetNetworkGraphResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

expectError(getNetworkGraph());
expectError(getNetworkGraph({}));

expectType<GetNetworkGraphResult>(await getNetworkGraph({lnd}));

expectType<void>(
  getNetworkGraph({lnd}, (error, result) => {
    expectType<GetNetworkGraphResult>(result);
  })
);
