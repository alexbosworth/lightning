import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {
  getPendingChainBalance,
  GetPendingChainBalanceResult,
} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

expectError(getPendingChainBalance());
expectError(getPendingChainBalance({}));

expectType<GetPendingChainBalanceResult>(await getPendingChainBalance({lnd}));

expectType<void>(
  getPendingChainBalance({lnd}, (error, result) => {
    expectType<GetPendingChainBalanceResult>(result);
  })
);
