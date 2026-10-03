import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {
  broadcastChainTransaction,
  BroadcastChainTransactionResult,
} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const transaction = '010000000111111111111111111111111111111111111111111111111111111111111111110000000000ffffffff010100000000000000015100000000';
const description = 'description';

// @ts-expect-error
broadcastChainTransaction();
// @ts-expect-error
broadcastChainTransaction({});
// @ts-expect-error
broadcastChainTransaction({description});
// @ts-expect-error
broadcastChainTransaction({lnd});
// @ts-expect-error
broadcastChainTransaction({lnd, description});

expectType<BroadcastChainTransactionResult>()(
  await broadcastChainTransaction({lnd, transaction})
);
expectType<BroadcastChainTransactionResult>()(
  await broadcastChainTransaction({lnd, transaction, description})
);

expectType<void>()(
  broadcastChainTransaction({lnd, transaction}, (error, result) => {
    expectType<BroadcastChainTransactionResult>()(result);
  })
);
expectType<void>()(
  broadcastChainTransaction(
    {lnd, transaction, description},
    (error, result) => {
      expectType<BroadcastChainTransactionResult>()(result);
    }
  )
);
