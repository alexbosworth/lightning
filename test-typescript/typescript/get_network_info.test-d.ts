import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getNetworkInfo, GetNetworkInfoResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

// @ts-expect-error
getNetworkInfo();
// @ts-expect-error
getNetworkInfo({});

expectType<GetNetworkInfoResult>()(await getNetworkInfo({lnd}));

expectType<void>()(
  getNetworkInfo({lnd}, (error, result) => {
    expectType<GetNetworkInfoResult>()(result);
  })
);
