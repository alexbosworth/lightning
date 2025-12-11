import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {
  getNetworkCentrality,
  GetNetworkCentralityResult,
} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

expectError(getNetworkCentrality());
expectError(getNetworkCentrality({}));

expectType<GetNetworkCentralityResult>(await getNetworkCentrality({lnd}));

expectType<void>(
  getNetworkCentrality({lnd}, (error, result) => {
    expectType<GetNetworkCentralityResult>(result);
  })
);
