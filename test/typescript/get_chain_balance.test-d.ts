import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getChainBalance, GetChainBalanceResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

expectError(getChainBalance());
expectError(getChainBalance({}));

expectType<GetChainBalanceResult>(await getChainBalance({lnd}));

expectType<void>(
  getChainBalance({lnd}, (error, result) => {
    expectType<GetChainBalanceResult>(result);
  })
);
