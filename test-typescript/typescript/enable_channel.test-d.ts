import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {enableChannel} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const is_force_enable = true;
const transaction_id = 'txid';
const transaction_vout = 0;

expectError(enableChannel());
expectError(enableChannel({}));
expectError(enableChannel({lnd}));
expectError(enableChannel({is_force_enable}));
expectError(enableChannel({transaction_id}));
expectError(enableChannel({transaction_vout}));
expectError(enableChannel({lnd, is_force_enable}));
expectError(enableChannel({lnd, transaction_id}));
expectError(enableChannel({lnd, transaction_vout}));
expectError(enableChannel({lnd, transaction_id, is_force_enable}));
expectError(enableChannel({lnd, transaction_vout, is_force_enable}));

expectType<void>(await enableChannel({lnd, transaction_id, transaction_vout}));
expectType<void>(
  await enableChannel({lnd, transaction_id, transaction_vout, is_force_enable})
);

expectType<void>(
  enableChannel({lnd, transaction_id, transaction_vout}, () => {})
);
expectType<void>(
  enableChannel(
    {lnd, transaction_id, transaction_vout, is_force_enable},
    () => {}
  )
);
