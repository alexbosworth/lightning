import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getWalletInfo, GetWalletInfoResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

expectError(getWalletInfo());
expectError(getWalletInfo({}));

expectType<GetWalletInfoResult>(await getWalletInfo({lnd}));

expectType<void>(
  getWalletInfo({lnd}, (error, result) => {
    expectType<GetWalletInfoResult>(result);
  })
);
