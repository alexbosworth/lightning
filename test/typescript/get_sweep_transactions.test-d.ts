import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {
  getSweepTransactions,
  GetSweepTransactionsResult,
} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

expectError(getSweepTransactions());
expectError(getSweepTransactions({}));

expectType<GetSweepTransactionsResult>(await getSweepTransactions({lnd}));

expectType<void>(
  getSweepTransactions({lnd}, (error, result) => {
    expectType<GetSweepTransactionsResult>(result);
  })
);
