import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {
  getSweepTransactions,
  GetSweepTransactionsResult,
} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

// @ts-expect-error
getSweepTransactions();
// @ts-expect-error
getSweepTransactions({});

expectType<GetSweepTransactionsResult>()(await getSweepTransactions({lnd}));

expectType<void>()(
  getSweepTransactions({lnd}, (error, result) => {
    expectType<GetSweepTransactionsResult>()(result);
  })
);
