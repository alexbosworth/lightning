import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {deletePendingChannel} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const confirmed_transaction = 'tx0';
const pending_transaction = 'tx1';
const pending_transaction_vout = 1;

// @ts-expect-error
deletePendingChannel();
// @ts-expect-error
deletePendingChannel({});
// @ts-expect-error
deletePendingChannel({lnd});
// @ts-expect-error
deletePendingChannel({confirmed_transaction});
// @ts-expect-error
deletePendingChannel({pending_transaction});
// @ts-expect-error
deletePendingChannel({pending_transaction_vout});
// @ts-expect-error
deletePendingChannel({lnd, confirmed_transaction});
// @ts-expect-error
deletePendingChannel({lnd, pending_transaction});
// @ts-expect-error
deletePendingChannel({lnd, pending_transaction_vout});
// @ts-expect-error
deletePendingChannel({lnd, confirmed_transaction, pending_transaction});
// @ts-expect-error
deletePendingChannel({lnd, confirmed_transaction, pending_transaction_vout});
// @ts-expect-error
deletePendingChannel({lnd, pending_transaction, pending_transaction_vout});

expectType<void>()(
  await deletePendingChannel({
    lnd,
    confirmed_transaction,
    pending_transaction,
    pending_transaction_vout,
  })
);

expectType<void>()(
  deletePendingChannel(
    {lnd, confirmed_transaction, pending_transaction, pending_transaction_vout},
    () => {}
  )
);
