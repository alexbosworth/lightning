import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getWalletVersion, GetWalletVersionResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

expectError(getWalletVersion());
expectError(getWalletVersion({}));

expectType<GetWalletVersionResult>(await getWalletVersion({lnd}));

expectType<void>(
  getWalletVersion({lnd}, (error, result) => {
    expectType<GetWalletVersionResult>(result);
  })
);
