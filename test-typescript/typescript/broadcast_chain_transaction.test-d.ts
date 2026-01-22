import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {
  broadcastChainTransaction,
  BroadcastChainTransactionResult,
} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const transaction = '01000000000000000000';
const description = 'description';

expectError(broadcastChainTransaction());
expectError(broadcastChainTransaction({}));
expectError(broadcastChainTransaction({description}));
expectError(broadcastChainTransaction({lnd}));
expectError(broadcastChainTransaction({lnd, description}));

expectType<BroadcastChainTransactionResult>(
  await broadcastChainTransaction({lnd, transaction})
);
expectType<BroadcastChainTransactionResult>(
  await broadcastChainTransaction({lnd, transaction, description})
);

expectType<void>(
  broadcastChainTransaction({lnd, transaction}, (error, result) => {
    expectType<BroadcastChainTransactionResult>(result);
  })
);
expectType<void>(
  broadcastChainTransaction(
    {lnd, transaction, description},
    (error, result) => {
      expectType<BroadcastChainTransactionResult>(result);
    }
  )
);
