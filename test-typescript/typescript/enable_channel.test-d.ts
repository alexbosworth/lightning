import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {enableChannel} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const is_force_enable = true;
const transaction_id = 'txid';
const transaction_vout = 0;

// @ts-expect-error
enableChannel();
// @ts-expect-error
enableChannel({});
// @ts-expect-error
enableChannel({lnd});
// @ts-expect-error
enableChannel({is_force_enable});
// @ts-expect-error
enableChannel({transaction_id});
// @ts-expect-error
enableChannel({transaction_vout});
// @ts-expect-error
enableChannel({lnd, is_force_enable});
// @ts-expect-error
enableChannel({lnd, transaction_id});
// @ts-expect-error
enableChannel({lnd, transaction_vout});
// @ts-expect-error
enableChannel({lnd, transaction_id, is_force_enable});
// @ts-expect-error
enableChannel({lnd, transaction_vout, is_force_enable});

expectType<void>()(await enableChannel({lnd, transaction_id, transaction_vout}));
expectType<void>()(
  await enableChannel({lnd, transaction_id, transaction_vout, is_force_enable})
);

expectType<void>()(
  enableChannel({lnd, transaction_id, transaction_vout}, () => {})
);
expectType<void>()(
  enableChannel(
    {lnd, transaction_id, transaction_vout, is_force_enable},
    () => {}
  )
);
