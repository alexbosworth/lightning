import {expectType} from '../expect';
import {UnauthenticatedLnd} from '../../lnd_grpc';
import {getWalletStatus, GetWalletStatusResult} from '../../lnd_methods';

const lnd = {} as UnauthenticatedLnd;

// @ts-expect-error
getWalletStatus();
// @ts-expect-error
getWalletStatus({});

expectType<GetWalletStatusResult>()(await getWalletStatus({lnd}));

expectType<void>()(
  getWalletStatus({lnd}, (error, result) => {
    expectType<GetWalletStatusResult>()(result);
  })
);
