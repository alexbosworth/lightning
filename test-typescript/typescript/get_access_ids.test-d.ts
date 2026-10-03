import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getAccessIds, GetAccessIdsResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

// @ts-expect-error
getAccessIds();
// @ts-expect-error
getAccessIds({});

expectType<GetAccessIdsResult>()(await getAccessIds({lnd}));

expectType<void>()(
  getAccessIds({lnd}, (error, result) => {
    expectType<GetAccessIdsResult>()(result);
  })
);
