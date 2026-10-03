import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getUtxos, GetUtxosResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

const min_confirmations = 0;
const max_confirmations = 1;

// @ts-expect-error
getUtxos();
// @ts-expect-error
getUtxos({});

expectType<GetUtxosResult>()(await getUtxos({lnd}));
expectType<GetUtxosResult>()(
  await getUtxos({lnd, min_confirmations, max_confirmations})
);

expectType<void>()(
  getUtxos({lnd}, (error, result) => {
    expectType<GetUtxosResult>()(result);
  })
);
expectType<void>()(
  getUtxos({lnd, min_confirmations, max_confirmations}, (error, result) => {
    expectType<GetUtxosResult>()(result);
  })
);
