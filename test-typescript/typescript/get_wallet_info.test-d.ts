import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getWalletInfo, GetWalletInfoResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

// @ts-expect-error
getWalletInfo();
// @ts-expect-error
getWalletInfo({});

expectType<GetWalletInfoResult>()(await getWalletInfo({lnd}));

expectType<void>()(
  getWalletInfo({lnd}, (error, result) => {
    expectType<GetWalletInfoResult>()(result);
  })
);
