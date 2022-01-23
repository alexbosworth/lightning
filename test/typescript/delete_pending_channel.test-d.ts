import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {deletePendingChannel} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const confirmed_transaction = 'tx0';
const pending_transaction = 'tx1';
const pending_transaction_vout = 1;

expectError(deletePendingChannel());
expectError(deletePendingChannel({}));
expectError(deletePendingChannel({lnd}));
expectError(deletePendingChannel({confirmed_transaction}));
expectError(deletePendingChannel({pending_transaction}));
expectError(deletePendingChannel({pending_transaction_vout}));
expectError(deletePendingChannel({lnd, confirmed_transaction}));
expectError(deletePendingChannel({lnd, pending_transaction}));
expectError(deletePendingChannel({lnd, pending_transaction_vout}));
expectError(
  deletePendingChannel({lnd, confirmed_transaction, pending_transaction})
);
expectError(
  deletePendingChannel({lnd, confirmed_transaction, pending_transaction_vout})
);
expectError(
  deletePendingChannel({lnd, pending_transaction, pending_transaction_vout})
);

expectType<void>(
  await deletePendingChannel({
    lnd,
    confirmed_transaction,
    pending_transaction,
    pending_transaction_vout,
  })
);

expectType<void>(
  deletePendingChannel(
    {lnd, confirmed_transaction, pending_transaction, pending_transaction_vout},
    () => {}
  )
);
