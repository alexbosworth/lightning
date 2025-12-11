import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getAccessIds, GetAccessIdsResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

expectError(getAccessIds());
expectError(getAccessIds({}));

expectType<GetAccessIdsResult>(await getAccessIds({lnd}));

expectType<void>(
  getAccessIds({lnd}, (error, result) => {
    expectType<GetAccessIdsResult>(result);
  })
);
