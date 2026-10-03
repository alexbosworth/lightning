import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getLockedUtxos, GetLockedUtxosResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

// @ts-expect-error
getLockedUtxos();
// @ts-expect-error
getLockedUtxos({});

expectType<GetLockedUtxosResult>()(await getLockedUtxos({lnd}));

expectType<void>()(
  getLockedUtxos({lnd}, (error, result) => {
    expectType<GetLockedUtxosResult>()(result);
  })
);
