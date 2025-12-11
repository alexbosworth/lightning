import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {disableChannel} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const transaction_id = 'txid';
const transaction_vout = 0;

expectError(disableChannel());
expectError(disableChannel({}));
expectError(disableChannel({lnd}));
expectError(disableChannel({transaction_id}));
expectError(disableChannel({transaction_vout}));
expectError(disableChannel({lnd, transaction_id}));
expectError(disableChannel({lnd, transaction_vout}));

expectType<void>(await disableChannel({lnd, transaction_id, transaction_vout}));

expectType<void>(
  disableChannel({lnd, transaction_id, transaction_vout}, () => {})
);
