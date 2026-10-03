import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {
  getNetworkCentrality,
  GetNetworkCentralityResult,
} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

// @ts-expect-error
getNetworkCentrality();
// @ts-expect-error
getNetworkCentrality({});

expectType<GetNetworkCentralityResult>()(await getNetworkCentrality({lnd}));

expectType<void>()(
  getNetworkCentrality({lnd}, (error, result) => {
    expectType<GetNetworkCentralityResult>()(result);
  })
);
