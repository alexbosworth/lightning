import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getNetworkInfo, GetNetworkInfoResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

expectError(getNetworkInfo());
expectError(getNetworkInfo({}));

expectType<GetNetworkInfoResult>(await getNetworkInfo({lnd}));

expectType<void>(
  getNetworkInfo({lnd}, (error, result) => {
    expectType<GetNetworkInfoResult>(result);
  })
);
