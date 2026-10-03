import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {disableChannel} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const transaction_id = 'txid';
const transaction_vout = 0;

// @ts-expect-error
disableChannel();
// @ts-expect-error
disableChannel({});
// @ts-expect-error
disableChannel({lnd});
// @ts-expect-error
disableChannel({transaction_id});
// @ts-expect-error
disableChannel({transaction_vout});
// @ts-expect-error
disableChannel({lnd, transaction_id});
// @ts-expect-error
disableChannel({lnd, transaction_vout});

expectType<void>()(await disableChannel({lnd, transaction_id, transaction_vout}));

expectType<void>()(
  disableChannel({lnd, transaction_id, transaction_vout}, () => {})
);
