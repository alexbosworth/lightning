import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {
  getPendingChainBalance,
  GetPendingChainBalanceResult,
} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

// @ts-expect-error
getPendingChainBalance();
// @ts-expect-error
getPendingChainBalance({});

expectType<GetPendingChainBalanceResult>()(await getPendingChainBalance({lnd}));

expectType<void>()(
  getPendingChainBalance({lnd}, (error, result) => {
    expectType<GetPendingChainBalanceResult>()(result);
  })
);
