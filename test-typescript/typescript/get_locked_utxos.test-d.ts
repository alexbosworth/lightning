import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getLockedUtxos, GetLockedUtxosResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

expectError(getLockedUtxos());
expectError(getLockedUtxos({}));

expectType<GetLockedUtxosResult>(await getLockedUtxos({lnd}));

expectType<void>(
  getLockedUtxos({lnd}, (error, result) => {
    expectType<GetLockedUtxosResult>(result);
  })
);
