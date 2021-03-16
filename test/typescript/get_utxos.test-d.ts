import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getUtxos, GetUtxosResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

const min_confirmations = 0;
const max_confirmations = 1;

expectError(getUtxos());
expectError(getUtxos({}));

expectType<GetUtxosResult>(await getUtxos({lnd}));
expectType<GetUtxosResult>(
  await getUtxos({lnd, min_confirmations, max_confirmations})
);

expectType<void>(
  getUtxos({lnd}, (error, result) => {
    expectType<GetUtxosResult>(result);
  })
);
expectType<void>(
  getUtxos({lnd, min_confirmations, max_confirmations}, (error, result) => {
    expectType<GetUtxosResult>(result);
  })
);
