import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {
  getChainTransactions,
  GetChainTransactionsResult,
} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

const before = 2;
const after = 1;

// @ts-expect-error
getChainTransactions();
// @ts-expect-error
getChainTransactions({});

expectType<GetChainTransactionsResult>()(await getChainTransactions({lnd}));
expectType<GetChainTransactionsResult>()(
  await getChainTransactions({lnd, before, after})
);

expectType<void>()(
  getChainTransactions({lnd}, (error, result) => {
    expectType<GetChainTransactionsResult>()(result);
  })
);
expectType<void>()(
  getChainTransactions({lnd, before, after}, (error, result) => {
    expectType<GetChainTransactionsResult>()(result);
  })
);
