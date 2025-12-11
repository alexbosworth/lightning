import {expectError, expectType} from 'tsd';
import {UnauthenticatedLnd} from '../../lnd_grpc';
import {getWalletStatus, GetWalletStatusResult} from '../../lnd_methods';

const lnd = {} as UnauthenticatedLnd;

expectError(getWalletStatus());
expectError(getWalletStatus({}));

expectType<GetWalletStatusResult>(await getWalletStatus({lnd}));

expectType<void>(
  getWalletStatus({lnd}, (error, result) => {
    expectType<GetWalletStatusResult>(result);
  })
);
